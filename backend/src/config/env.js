import dotenv from "dotenv";

dotenv.config();
// Fail fast on boot if a required variable is missing, instead of crashing later
const required = [
  "MONGO_URI",
  "REDIS_URL",
  "JWT_SECRET",
  "BASE_URL",
  "CLIENT_URL",
];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env variable: ${key}`);
    process.exit(1);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT) || 5000,
  baseUrl: process.env.BASE_URL.replace(/\/$/, ""),
  clientUrl: process.env.CLIENT_URL.replace(/\/$/, ""),
  mongoUri: process.env.MONGO_URI,
  redisUrl: process.env.REDIS_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  safeBrowsingKey: process.env.SAFE_BROWSING_API_KEY || "",
  adminEmail: (process.env.ADMIN_EMAIL || "").toLowerCase(),

  // Razorpay. Billing endpoints return 503 until these are set.
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
    // Razorpay plan ids created by `npm run razorpay:plans`
    planIds: {
      starter: process.env.RAZORPAY_PLAN_STARTER || "",
      pro: process.env.RAZORPAY_PLAN_PRO || "",
    },
  },
  businessName: process.env.BUSINESS_NAME || "Linkzy",
};
