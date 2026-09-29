import { env } from "../config/env.js";
import { WebhookEvent } from "../models/WebhookEvent.js";
import { Subscription } from "../models/Subscription.js";
import {
  cancelSubscription,
  createSubscription,
  getBillingOverview,
  recordPayment,
  syncSubscription,
  verifyCheckout,
} from "../services/billingService.js";
import { verifyWebhookSignature } from "../utils/razorpaySignature.js";
import { AppError } from "../utils/AppError.js";

export async function overview(req, res) {
  res.json(await getBillingOverview(req.user));
}

export async function subscribe(req, res) {
  res.status(201).json(await createSubscription(req.user, req.body.plan));
}

export async function verify(req, res) {
  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;
  const result = await verifyCheckout(req.user, {
    paymentId: razorpay_payment_id,
    subscriptionId: razorpay_subscription_id,
    signature: razorpay_signature,
  });
  res.json(result);
}

export async function cancel(req, res) {
  res.json(await cancelSubscription(req.user));
}

// Handles one verified webhook event
async function handleEvent(event) {
  const subEntity = event.payload?.subscription?.entity;
  const paymentEntity = event.payload?.payment?.entity;

  if (event.event.startsWith("subscription.") && subEntity) {
    const sub = await syncSubscription(subEntity);
    // subscription.charged carries the payment for the new billing cycle
    if (event.event === "subscription.charged" && paymentEntity) {
      await recordPayment(paymentEntity, sub);
    }
    return;
  }

  // Failed auto-debit: record it so it shows in the user's history
  if (event.event === "payment.failed" && paymentEntity) {
    const subId = paymentEntity.notes?.subscription_id || paymentEntity.subscription_id;
    if (!subId) return;
    const sub = await Subscription.findOne({ razorpaySubscriptionId: subId });
    await recordPayment(paymentEntity, sub);
  }
}

// POST /api/billing/webhook. Mounted with express.raw() so req.body is a Buffer.
export async function webhook(req, res) {
  if (!env.razorpay.webhookSecret) throw new AppError("Webhook secret not configured", 503);

  const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "";
  const signature = req.headers["x-razorpay-signature"];
  if (!rawBody || !verifyWebhookSignature(rawBody, signature, env.razorpay.webhookSecret)) {
    throw new AppError("Invalid webhook signature", 400);
  }

  const event = JSON.parse(rawBody);
  // Razorpay sends a unique id per event; fall back to a derived key just in case
  const eventId =
    req.headers["x-razorpay-event-id"] ||
    `${event.event}:${event.created_at}:${event.payload?.payment?.entity?.id || event.payload?.subscription?.entity?.id}`;

  // Idempotency: insert first, a duplicate key means we already processed it
  try {
    await WebhookEvent.create({ eventId, event: event.event });
  } catch (err) {
    if (err.code === 11000) return res.json({ status: "duplicate" });
    throw err;
  }

  try {
    await handleEvent(event);
  } catch (err) {
    // Remove the marker so Razorpay's retry gets processed again
    await WebhookEvent.deleteOne({ eventId });
    throw err;
  }

  res.json({ status: "ok" });
}
