import mongoose from "mongoose";

const bioLinkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 60 },
    url: { type: String, required: true, maxlength: 2048 },
  },
  { _id: true }
);

const bioPageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayName: { type: String, trim: true, maxlength: 60, default: "" },
    bio: { type: String, trim: true, maxlength: 200, default: "" },
    avatarUrl: { type: String, default: "" },
    theme: { type: String, enum: ["light", "dark", "sunset", "ocean"], default: "light" },
    whatsapp: { type: String, trim: true, default: "" }, // number with country code
    instagram: { type: String, trim: true, default: "" }, // handle without @
    links: { type: [bioLinkSchema], default: [] },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const BioPage = mongoose.model("BioPage", bioPageSchema);
