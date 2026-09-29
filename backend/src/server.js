import mongoose from "mongoose";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { redis } from "./config/redis.js";
import { startClickWorker } from "./workers/clickProcessor.js";

await connectDB();

// Click counting runs inside the API by default, so one process is enough.
// Set RUN_CLICK_WORKER=false to run it separately with `npm run worker` instead.
const clickWorker = env.runClickWorker ? startClickWorker() : null;

const server = app.listen(env.port, () => {
  console.log(`API running on port ${env.port} (${env.nodeEnv})`);
});

async function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  server.close(async () => {
    await clickWorker?.close(); // let in-flight click jobs finish
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
