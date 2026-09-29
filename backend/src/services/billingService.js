import { env } from "../config/env.js";
import { PLANS } from "../config/plans.js";
import {
  razorpay,
  requireRazorpay,
  razorpayPlanId,
  planKeyFromRazorpayPlanId,
  isBillingConfigured,
} from "../config/razorpay.js";
import { Subscription } from "../models/Subscription.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { verifySubscriptionPayment } from "../utils/razorpaySignature.js";

const PAID_PLANS = ["starter", "pro"];
// Statuses where the customer has an ongoing (not ended) subscription
const LIVE_STATUSES = ["authenticated", "active", "pending"];
// Extra time after the billing period ends before access is removed,
// so a slightly late auto-debit doesn't downgrade the user
const GRACE_MS = 24 * 60 * 60 * 1000;
// 10 years of monthly charges; Razorpay requires a finite total_count
const TOTAL_COUNT = 120;

const fromUnix = (seconds) => (seconds ? new Date(seconds * 1000) : null);

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createSubscription(user, planKey) {
  const rp = requireRazorpay();
  if (!PAID_PLANS.includes(planKey)) throw new AppError("Invalid plan", 400);

  const planId = razorpayPlanId(planKey);
  if (!planId) throw new AppError(`Razorpay plan id for "${planKey}" is not configured`, 503);

  // Block buying the same plan twice while the current one is running
  const running = await Subscription.findOne({
    user: user._id,
    plan: planKey,
    status: { $in: LIVE_STATUSES },
    cancelAtPeriodEnd: false,
  });
  if (running) throw new AppError(`You are already subscribed to ${PLANS[planKey].name}`, 409);

  // Reuse a recent unpaid subscription instead of creating a new one on every click
  const pending = await Subscription.findOne({
    user: user._id,
    plan: planKey,
    status: "created",
    createdAt: { $gte: new Date(Date.now() - GRACE_MS) },
  });

  const sub =
    pending ||
    (await (async () => {
      const entity = await rp.subscriptions.create({
        plan_id: planId,
        total_count: TOTAL_COUNT,
        quantity: 1,
        customer_notify: 1,
        notes: { userId: String(user._id), plan: planKey },
      });
      return Subscription.create({
        user: user._id,
        plan: planKey,
        razorpaySubscriptionId: entity.id,
        razorpayPlanId: planId,
        status: entity.status,
        shortUrl: entity.short_url || "",
      });
    })());

  // Everything the frontend needs to open Razorpay Checkout
  return {
    keyId: env.razorpay.keyId,
    subscriptionId: sub.razorpaySubscriptionId,
    name: env.businessName,
    description: `${PLANS[planKey].name} plan – ₹${PLANS[planKey].price}/month`,
    prefill: { name: user.name, email: user.email },
  };
}

// ---------------------------------------------------------------------------
// Sync (used by both webhook and verify endpoint)
// ---------------------------------------------------------------------------

// Cancels every other live subscription of the user (used after upgrade/downgrade)
async function cancelOtherSubscriptions(userId, keepId) {
  const others = await Subscription.find({
    user: userId,
    razorpaySubscriptionId: { $ne: keepId },
    status: { $in: LIVE_STATUSES },
  });

  for (const other of others) {
    try {
      await razorpay.subscriptions.cancel(other.razorpaySubscriptionId, false);
    } catch (err) {
      // Already cancelled on Razorpay's side is fine; anything else gets logged
      console.error(`Could not cancel ${other.razorpaySubscriptionId}:`, err?.error?.description || err.message);
    }
    other.status = "cancelled";
    await other.save();
  }
}

// Grants the plan to the user while the subscription is active
async function applyToUser(sub) {
  if (sub.status !== "active" || !sub.currentEnd) return;

  await User.updateOne(
    { _id: sub.user },
    { plan: sub.plan, planExpiresAt: new Date(sub.currentEnd.getTime() + GRACE_MS) }
  );
  await cancelOtherSubscriptions(sub.user, sub.razorpaySubscriptionId);
}

// Takes a Razorpay subscription entity and mirrors it into our DB + user plan.
// For cancelled/halted/completed we do NOT downgrade immediately: the user keeps
// access until planExpiresAt, and User.activePlan() falls back to free after that.
export async function syncSubscription(entity) {
  let sub = await Subscription.findOne({ razorpaySubscriptionId: entity.id });

  // Subscription created outside our app flow (e.g. dashboard): link via notes
  if (!sub) {
    const planKey = planKeyFromRazorpayPlanId(entity.plan_id) || entity.notes?.plan;
    const userId = entity.notes?.userId;
    if (!userId || !PAID_PLANS.includes(planKey)) return null;
    sub = new Subscription({
      user: userId,
      plan: planKey,
      razorpaySubscriptionId: entity.id,
      razorpayPlanId: entity.plan_id,
    });
  }

  sub.status = entity.status;
  sub.currentStart = fromUnix(entity.current_start) || sub.currentStart;
  sub.currentEnd = fromUnix(entity.current_end) || sub.currentEnd;
  if (entity.status === "cancelled" || entity.status === "completed") sub.cancelAtPeriodEnd = false;
  await sub.save();

  await applyToUser(sub);
  return sub;
}

// Saves a payment once (unique razorpayPaymentId makes repeated webhooks harmless)
export async function recordPayment(paymentEntity, sub) {
  if (!paymentEntity?.id || !sub) return;
  await Payment.updateOne(
    { razorpayPaymentId: paymentEntity.id },
    {
      $setOnInsert: {
        user: sub.user,
        razorpayPaymentId: paymentEntity.id,
        razorpaySubscriptionId: sub.razorpaySubscriptionId,
        razorpayInvoiceId: paymentEntity.invoice_id || "",
        plan: sub.plan,
        amount: paymentEntity.amount,
        currency: paymentEntity.currency || "INR",
        status: paymentEntity.status === "failed" ? "failed" : "captured",
        method: paymentEntity.method || "",
        paidAt: fromUnix(paymentEntity.created_at) || new Date(),
      },
    },
    { upsert: true }
  );
}

// ---------------------------------------------------------------------------
// Checkout verification
// ---------------------------------------------------------------------------

export async function verifyCheckout(user, { paymentId, subscriptionId, signature }) {
  const rp = requireRazorpay();

  const sub = await Subscription.findOne({ razorpaySubscriptionId: subscriptionId, user: user._id });
  if (!sub) throw new AppError("Subscription not found", 404);

  const valid = verifySubscriptionPayment({ paymentId, subscriptionId, signature }, env.razorpay.keySecret);
  if (!valid) throw new AppError("Payment verification failed", 400);

  // Never trust the browser for status: fetch the real state from Razorpay
  const [entity, payment] = await Promise.all([
    rp.subscriptions.fetch(subscriptionId),
    rp.payments.fetch(paymentId).catch(() => null),
  ]);

  const synced = await syncSubscription(entity);
  if (payment) await recordPayment(payment, synced);

  // "authenticated" means the mandate is set and the first charge is processing;
  // the webhook will flip it to "active" within seconds
  return { status: synced.status, active: synced.status === "active" };
}

// ---------------------------------------------------------------------------
// Cancel
// ---------------------------------------------------------------------------

export async function cancelSubscription(user) {
  const rp = requireRazorpay();

  const sub = await Subscription.findOne({
    user: user._id,
    status: { $in: LIVE_STATUSES },
  }).sort({ createdAt: -1 });
  if (!sub) throw new AppError("No active subscription to cancel", 404);
  if (sub.cancelAtPeriodEnd) throw new AppError("Subscription is already set to cancel", 409);

  // true = cancel at the end of the current billing cycle (user keeps what they paid for)
  const entity = await rp.subscriptions.cancel(sub.razorpaySubscriptionId, true);
  sub.cancelAtPeriodEnd = true;
  await sub.save();
  await syncSubscription(entity);

  return { accessUntil: sub.currentEnd };
}

// ---------------------------------------------------------------------------
// Overview for the billing page
// ---------------------------------------------------------------------------

export async function getBillingOverview(user) {
  const [subscription, payments] = await Promise.all([
    Subscription.findOne({ user: user._id, status: { $ne: "created" } }).sort({ createdAt: -1 }).lean(),
    Payment.find({ user: user._id }).sort({ paidAt: -1 }).limit(24).lean(),
  ]);

  return {
    configured: isBillingConfigured && PAID_PLANS.every((p) => razorpayPlanId(p)),
    currentPlan: user.activePlan(),
    planExpiresAt: user.planExpiresAt,
    subscription: subscription && {
      plan: subscription.plan,
      status: subscription.status,
      currentEnd: subscription.currentEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    },
    payments: payments.map((p) => ({
      id: p.razorpayPaymentId,
      plan: p.plan,
      amount: p.amount / 100, // paise -> rupees
      currency: p.currency,
      status: p.status,
      method: p.method,
      paidAt: p.paidAt,
    })),
  };
}
