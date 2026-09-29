import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    plan: { type: String, enum: ["free", "starter", "pro"], default: "free" },
    planExpiresAt: { type: Date, default: null },
    isBanned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password only when it was changed
userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Effective plan: falls back to free once a paid plan has expired
userSchema.methods.activePlan = function activePlan() {
  if (this.plan !== "free" && this.planExpiresAt && this.planExpiresAt < new Date()) {
    return "free";
  }
  return this.plan;
};

userSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model("User", userSchema);
