// Runs as a separate process (PM2 app "linkzy-worker") so analytics never
// competes with the API for CPU.
import { Worker } from "bullmq";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { createQueueConnection } from "../config/redis.js";
import { CLICK_QUEUE } from "../queues/clickQueue.js";
import { Link } from "../models/Link.js";
import { Click } from "../models/Click.js";
import { User } from "../models/User.js";
import { consumeClickQuota } from "../middlewares/quota.js";

await connectDB();

const worker = new Worker(
  CLICK_QUEUE,
  async (job) => {
    const { linkId, userId, referrer, device, browser, os, country, at } = job.data;

    // Total click counter is always updated (users always see the total)
    await Link.updateOne({ _id: linkId }, { $inc: { clicks: 1 } });

    // Detailed analytics are stored only within the plan's monthly quota
    const user = await User.findById(userId).select("plan planExpiresAt").lean();
    if (!user) return;
    const planKey =
      user.plan !== "free" && user.planExpiresAt && new Date(user.planExpiresAt) < new Date()
        ? "free"
        : user.plan;

    const allowed = await consumeClickQuota(userId, planKey);
    if (!allowed) return;

    await Click.create({
      link: linkId,
      user: userId,
      referrer,
      device,
      browser,
      os,
      country,
      createdAt: new Date(at),
    });
  },
  { connection: createQueueConnection(), concurrency: 25 }
);

worker.on("ready", () => console.log("Click worker ready"));
worker.on("failed", (job, err) => console.error(`Click job ${job?.id} failed:`, err.message));

// Graceful shutdown so in-flight jobs finish on PM2 restart
async function shutdown() {
  await worker.close();
  await mongoose.disconnect();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
