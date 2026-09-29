import { z } from "zod";

const RESERVED = new Set([
  "api", "admin", "login", "register", "dashboard", "report", "pricing",
  "settings", "health", "static", "assets", "b", "u", "billing", "terms",
  "privacy", "refund", "contact", "not-found", "links", "bio",
]);

const aliasSchema = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9_-]{4,30}$/, "Alias must be 4-30 characters: letters, numbers, - or _")
  .refine((v) => !RESERVED.has(v.toLowerCase()), "This alias is reserved");

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().email(),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const createLinkSchema = z.object({
  originalUrl: z.string().trim().min(1, "URL is required").max(2048),
  title: z.string().trim().max(100).optional(),
  customAlias: aliasSchema.optional().or(z.literal("").transform(() => undefined)),
  expiresInDays: z.coerce.number().int().min(1).max(3650).optional(),
});

export const updateLinkSchema = z.object({
  originalUrl: z.string().trim().max(2048).optional(),
  title: z.string().trim().max(100).optional(),
  isActive: z.boolean().optional(),
});

export const bioPageSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_.]{3,30}$/, "Username must be 3-30 characters: a-z, 0-9, _ or ."),
  displayName: z.string().trim().max(60).optional(),
  bio: z.string().trim().max(200).optional(),
  avatarUrl: z.string().trim().url().max(2048).optional().or(z.literal("")),
  theme: z.enum(["light", "dark", "sunset", "ocean"]).optional(),
  whatsapp: z.string().trim().regex(/^\d{0,15}$/, "Digits only, with country code").optional(),
  instagram: z.string().trim().regex(/^[a-zA-Z0-9_.]{0,30}$/, "Invalid Instagram handle").optional(),
  links: z
    .array(z.object({ label: z.string().trim().min(1).max(60), url: z.string().trim().max(2048) }))
    .max(20)
    .optional(),
});

export const reportSchema = z.object({
  shortCode: z.string().trim().min(1).max(30),
  reason: z.enum(["phishing", "malware", "spam", "other"]),
  details: z.string().trim().max(500).optional(),
});

export const subscribeSchema = z.object({
  plan: z.enum(["starter", "pro"]),
});

export const verifyPaymentSchema = z.object({
  razorpay_payment_id: z.string().min(1),
  razorpay_subscription_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});
