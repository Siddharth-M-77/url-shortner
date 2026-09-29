import { redis } from "../config/redis.js";
import { getPlan } from "../config/plans.js";
import { AppError } from "../utils/AppError.js";

// Current month key, e.g. "2026-09". Keys reset naturally each month.
export function monthKey() {
  return new Date().toISOString().slice(0, 7);
}

export function linkQuotaKey(userId) {
  return `quota:links:${userId}:${monthKey()}`;
}

export function clickQuotaKey(userId) {
  return `quota:clicks:${userId}:${monthKey()}`;
}

const MONTH_TTL = 60 * 60 * 24 * 32;

// Enforces monthly link-creation limit from the user's plan
export async function checkLinkQuota(req, _res, next) {
  const plan = getPlan(req.user.activePlan());
  if (plan.linksPerMonth === Infinity) return next();

  const key = linkQuotaKey(req.user._id);
  const used = await redis.incr(key);
  if (used === 1) await redis.expire(key, MONTH_TTL);

  if (used > plan.linksPerMonth) {
    await redis.decr(key); // roll back the rejected attempt
    throw new AppError(
      `You've used all ${plan.linksPerMonth} links for this month. Upgrade to create more.`,
      403
    );
  }

  // Let the controller roll back if creation fails later
  req.quotaKey = key;
  next();
}

// Returns true if this click should be recorded (does NOT block the redirect)
export async function consumeClickQuota(userId, planKey) {
  const plan = getPlan(planKey);
  if (plan.trackedClicksPerMonth === Infinity) return true;

  const key = clickQuotaKey(userId);
  const used = await redis.incr(key);
  if (used === 1) await redis.expire(key, MONTH_TTL);
  return used <= plan.trackedClicksPerMonth;
}

export async function getUsage(userId) {
  const [links, clicks] = await redis.mget(linkQuotaKey(userId), clickQuotaKey(userId));
  return { linksThisMonth: Number(links) || 0, trackedClicksThisMonth: Number(clicks) || 0 };
}
