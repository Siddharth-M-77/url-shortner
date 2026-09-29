import mongoose from "mongoose";

// Mirror of a Razorpay subscription. Razorpay is the source of truth;
// this is kept in sync by the webhook and the verify endpoint.
const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: String, enum: ["starter", "pro"], required: true },
    razorpaySubscriptionId: { type: String, required: true, unique: true },
    razorpayPlanId: { type: String, required: true },
    // Razorpay statuses: created, authenticated, active, pending, halted,
    // cancelled, completed, expired, paused
    status: { type: String, default: "created" },
    currentStart: { type: Date, default: null },
    currentEnd: { type: Date, default: null },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    shortUrl: { type: String, default: "" }, // Razorpay hosted payment link (fallback)
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1, createdAt: -1 });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
