import crypto from "node:crypto";

// Constant-time comparison so attackers can't guess the signature byte by byte
function safeEqual(a, b) {
  const bufA = Buffer.from(a || "", "utf8");
  const bufB = Buffer.from(b || "", "utf8");
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

function hmac(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

// Checkout success for subscriptions: signature = HMAC(payment_id + "|" + subscription_id)
export function verifySubscriptionPayment({ paymentId, subscriptionId, signature }, keySecret) {
  return safeEqual(hmac(`${paymentId}|${subscriptionId}`, keySecret), signature);
}

// Webhooks: signature = HMAC(raw request body) with the webhook secret
export function verifyWebhookSignature(rawBody, signature, webhookSecret) {
  return safeEqual(hmac(rawBody, webhookSecret), signature);
}
