import rateLimit from "express-rate-limit";

const common = { standardHeaders: "draft-7", legacyHeaders: false };

// Brute-force protection on login/register
export const authLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { message: "Too many attempts, try again in 15 minutes" },
});

// Stops a single account/IP from mass-creating spam links
export const createLinkLimiter = rateLimit({
  ...common,
  windowMs: 60 * 1000,
  limit: 30,
  message: { message: "Slow down, too many links created in a minute" },
});

export const reportLimiter = rateLimit({
  ...common,
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: { message: "Too many reports from this IP" },
});

// General API limit
export const apiLimiter = rateLimit({
  ...common,
  windowMs: 60 * 1000,
  limit: 300,
});
