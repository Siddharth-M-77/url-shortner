// Click processing, shared by the API process (default) and the standalone worker.
// Takes jobs queued by the redirect and turns them into click counts + analytics.
import { Worker } from "bullmq";
import { createQueueConnection } from "../config/redis.js";
import { CLICK_QUEUE, LOG_CLICKS } from "../queues/clickQueue.js";
import { Link } from "../models/Link.js";
import { Click } from "../models/Click.js";
import { User } from "../models/User.js";
import { consumeClickQuota } from "../middlewares/quota.js";

// Needs MongoDB to be connected first. Returns the BullMQ worker so callers can close it.
export function startClickWorker() {
  const worker = new Worker(
    CLICK_QUEUE,
    async (job) => {
      const { code, linkId, userId, referrer, device, browser, os, country, at } = job.data;
      const tag = `[click-worker] job ${job.id} /${code || "?"}`;

      // Total click counter is always updated (users always see the total)
      const updated = await Link.findOneAndUpdate(
        { _id: linkId },
        { $inc: { clicks: 1 } },
        { new: true, projection: { clicks: 1 } },
      ).lean();
      if (!updated) {
        console.warn(`${tag}: link ${linkId} not found in MongoDB, click NOT counted`);
        return;
      }
      if (LOG_CLICKS) console.log(`${tag}: counted, total clicks now ${updated.clicks} (${device}/${browser}, from ${referrer})`);

      // Detailed analytics are stored only within the plan's monthly quota
      const user = await User.findById(userId).select("plan planExpiresAt").lean();
      if (!user) {
        console.warn(`${tag}: owner ${userId} not found, detailed analytics skipped`);
        return;
      }
      const planKey =
        user.plan !== "free" && user.planExpiresAt && new Date(user.planExpiresAt) < new Date()
          ? "free"
          : user.plan;

      const allowed = await consumeClickQuota(userId, planKey);
      if (!allowed) {
        if (LOG_CLICKS) console.log(`${tag}: ${planKey} plan monthly analytics quota used up, only the total was counted`);
        return;
      }

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

  worker.on("ready", () => console.log(`Click worker ready, listening on queue "${CLICK_QUEUE}"`));
  // Connection problems (wrong Redis password, Redis down) would otherwise fail silently
  worker.on("error", (err) => console.error("[click-worker] Redis error:", err.message));
  worker.on("failed", (job, err) => console.error(`Click job ${job?.id} failed:`, err.message));

  return worker;
}
