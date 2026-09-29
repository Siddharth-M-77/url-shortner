import Razorpay from "razorpay";
import { env } from "./env.js";
import { AppError } from "../utils/AppError.js";

export const isBillingConfigured = Boolean(env.razorpay.keyId && env.razorpay.keySecret);

// Single SDK instance, or null when keys are missing (billing disabled)
export const razorpay = isBillingConfigured
  ? new Razorpay({ key_id: env.razorpay.keyId, key_secret: env.razorpay.keySecret })
  : null;

export function requireRazorpay() {
  if (!razorpay) throw new AppError("Payments are not configured yet", 503);
  return razorpay;
}

// Maps our plan key -> Razorpay plan id, and back
export function razorpayPlanId(planKey) {
  return env.razorpay.planIds[planKey] || "";
}

export function planKeyFromRazorpayPlanId(planId) {
  const entry = Object.entries(env.razorpay.planIds).find(([, id]) => id && id === planId);
  return entry ? entry[0] : null;
}
