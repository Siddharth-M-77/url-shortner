import mongoose from "mongoose";

// One record per successful (or failed) charge, used for payment history
const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    razorpayPaymentId: { type: String, required: true, unique: true }, // idempotency guard
    razorpaySubscriptionId: { type: String, default: "" },
    razorpayInvoiceId: { type: String, default: "" },
    plan: { type: String, default: "" },
    amount: { type: Number, required: true }, // in paise
    currency: { type: String, default: "INR" },
    status: { type: String, default: "captured" }, // captured | failed
    method: { type: String, default: "" }, // upi, card, netbanking...
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

paymentSchema.index({ user: 1, paidAt: -1 });

export const Payment = mongoose.model("Payment", paymentSchema);
