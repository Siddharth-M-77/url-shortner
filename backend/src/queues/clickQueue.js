import { Queue } from "bullmq";
import { createQueueConnection } from "../config/redis.js";

export const CLICK_QUEUE = "link-clicks";

export const clickQueue = new Queue(CLICK_QUEUE, {
  connection: createQueueConnection(),
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 1000, // keep last 1000 failures for debugging
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
  },
});

// Set LOG_CLICKS=false in .env to silence the per-click debug logs
export const LOG_CLICKS = process.env.LOG_CLICKS !== "false";

clickQueue.on("error", (err) => console.error("[click] queue Redis error:", err.message));

// Fire-and-forget: analytics must never slow down or break a redirect
export function enqueueClick(data) {
  clickQueue
    .add("click", data)
    .then((job) => {
      if (LOG_CLICKS) console.log(`[click] /${data.code} queued as job ${job.id} (source: ${data.referrer})`);
    })
    .catch((err) => {
      console.error(`[click] /${data.code} FAILED to queue:`, err.message);
    });
}
