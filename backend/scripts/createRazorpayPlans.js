// One-time script: creates the Starter and Pro monthly plans on Razorpay.
// Run: npm run razorpay:plans   (uses RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET from .env)
// Then copy the printed lines into backend/.env
// Run it once for test keys and once again for live keys (plans are per mode).
import Razorpay from "razorpay";
import "dotenv/config";
import { PLANS } from "../src/config/plans.js";

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.error("Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env first");
  process.exit(1);
}

const rp = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
const mode = RAZORPAY_KEY_ID.startsWith("rzp_live_") ? "LIVE" : "TEST";

console.log(`Creating plans in ${mode} mode...\n`);

for (const key of ["starter", "pro"]) {
  const plan = PLANS[key];
  const created = await rp.plans.create({
    period: "monthly",
    interval: 1,
    item: {
      name: `${plan.name} (monthly)`,
      amount: plan.price * 100, // Razorpay amounts are in paise
      currency: "INR",
      description: `${plan.name} plan, billed monthly`,
    },
    notes: { planKey: key },
  });
  console.log(`RAZORPAY_PLAN_${key.toUpperCase()}=${created.id}`);
}

console.log("\nCopy the lines above into backend/.env and restart the API.");
