import { Redis } from "ioredis";
import { env } from "./env.js";

// Shared client for cache, counters and quotas
export const redis = new Redis(env.redisUrl);

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err.message));

// BullMQ needs its own connection with maxRetriesPerRequest set to null
export function createQueueConnection() {
  return new Redis(env.redisUrl, { maxRetriesPerRequest: null });
}
