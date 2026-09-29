// Standalone click worker. Only needed when RUN_CLICK_WORKER=false in the API's .env,
// e.g. on a busy server where analytics should not share CPU with the API.
// Start with: npm run worker   (or PM2 app "linkzy-worker")
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { startClickWorker } from "./clickProcessor.js";

await connectDB();
const worker = startClickWorker();

// Graceful shutdown so in-flight jobs finish on PM2 restart
async function shutdown() {
  await worker.close();
  await mongoose.disconnect();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
