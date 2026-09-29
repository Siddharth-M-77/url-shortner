import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "./config/env.js";
import apiRoutes from "./routes/index.js";
import { redirect } from "./controllers/redirectController.js";
import { webhook as razorpayWebhook } from "./controllers/billingController.js";
import { apiLimiter } from "./middlewares/rateLimiters.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

const app = express();

// Behind Nginx: trust the first proxy so req.ip and rate limits use the real client IP
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
// Razorpay webhook needs the exact raw bytes to verify the HMAC signature,
// so it is registered BEFORE express.json() parses (and changes) the body
app.post("/api/billing/webhook", express.raw({ type: "application/json", limit: "1mb" }), razorpayWebhook);

app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
if (!env.isProd) app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api", apiLimiter, apiRoutes);
app.use("/api", notFound);

// Root of the short domain goes to the frontend landing page
app.get("/", (_req, res) => res.redirect(302, env.clientUrl));

// Short link redirect. Must stay LAST so it doesn't swallow other routes.
app.get("/:code", redirect);

app.use(notFound);
app.use(errorHandler);

export default app;
