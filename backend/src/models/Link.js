import mongoose from "mongoose";

const linkSchema = new mongoose.Schema(
  {
    shortCode: { type: String, required: true, unique: true },
    originalUrl: { type: String, required: true, maxlength: 2048 },
    title: { type: String, trim: true, maxlength: 100, default: "" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isCustom: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }, // user can pause a link
    isBlocked: { type: Boolean, default: false }, // admin blocked for abuse
    clicks: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Dashboard listing: "my links, newest first"
linkSchema.index({ user: 1, createdAt: -1 });

export const Link = mongoose.model("Link", linkSchema);
