import mongoose from "mongoose";

// One document per click. Kept lean on purpose; aggregated for charts.
const clickSchema = new mongoose.Schema({
  link: { type: mongoose.Schema.Types.ObjectId, ref: "Link", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  referrer: { type: String, default: "direct" }, // normalized source, e.g. "instagram"
  device: { type: String, default: "desktop" }, // mobile | tablet | desktop
  browser: { type: String, default: "unknown" },
  os: { type: String, default: "unknown" },
  country: { type: String, default: "unknown" },
});

clickSchema.index({ link: 1, createdAt: -1 });
// Auto-delete raw click events after 1 year to control storage
clickSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });

export const Click = mongoose.model("Click", clickSchema);
