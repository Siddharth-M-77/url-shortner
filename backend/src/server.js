import mongoose from "mongoose";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { redis } from "./config/redis.js";

await connectDB();

const server = app.listen(env.port, () => {
  console.log(`API running on port ${env.port} (${env.nodeEnv})`);
});

// Graceful shutdown: stop accepting new requests, finish in-flight ones, close DBs
async function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  server.close(async () => {
    await mongoose.disconnect();
    redis.disconnect();
    process.exit(0);
  });
  // Force exit if something hangs
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (err) =>
  console.error("Unhandled rejection:", err),
);
