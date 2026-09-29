import mongoose from "mongoose";

// Stores processed Razorpay event ids so retried/duplicate webhooks are ignored
const webhookEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  event: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Razorpay retries for about a day, keep ids for 30 days then auto-delete
webhookEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export const WebhookEvent = mongoose.model("WebhookEvent", webhookEventSchema);
