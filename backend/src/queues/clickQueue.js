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

// Fire-and-forget: analytics must never slow down or break a redirect
export function enqueueClick(data) {
  clickQueue.add("click", data).catch((err) => {
    console.error("Failed to enqueue click:", err.message);
  });
}
