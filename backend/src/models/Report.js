import mongoose from "mongoose";

// Abuse reports submitted by anyone (no login needed)
const reportSchema = new mongoose.Schema(
  {
    shortCode: { type: String, required: true },
    reason: { type: String, enum: ["phishing", "malware", "spam", "other"], required: true },
    details: { type: String, trim: true, maxlength: 500, default: "" },
    reporterIp: { type: String, default: "" },
    status: { type: String, enum: ["open", "actioned", "dismissed"], default: "open" },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });

export const Report = mongoose.model("Report", reportSchema);
