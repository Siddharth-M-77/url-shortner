import { Link } from "../models/Link.js";
import { redis } from "../config/redis.js";
import { getPlan } from "../config/plans.js";
import { generateShortCode } from "../utils/idGenerator.js";
import { assertValidUrl, assertNotMalicious } from "../utils/urlSafety.js";
import { AppError } from "../utils/AppError.js";

const CACHE_TTL = 60 * 60 * 24; // 24h for hot links
const NEGATIVE_TTL = 300; // 5 min for unknown codes
const NOT_FOUND = "__NF__";

const cacheKey = (code) => `link:${code}`;

export async function createLink({ user, originalUrl, title, customAlias, expiresInDays }) {
  const plan = getPlan(user.activePlan());
  const cleanUrl = assertValidUrl(originalUrl);
  await assertNotMalicious(cleanUrl);

  if (customAlias && !plan.customAlias) {
    throw new AppError("Custom aliases are available on Starter and Pro plans", 403);
  }

  const shortCode = customAlias || (await generateShortCode());
  const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 86_400_000) : null;

  const link = await Link.create({
    shortCode,
    originalUrl: cleanUrl,
    title: title || "",
    user: user._id,
    isCustom: Boolean(customAlias),
    expiresAt,
  });

  // Drop any negative cache entry created by someone probing this alias earlier
  await redis.del(cacheKey(shortCode));
  return link;
}

// Returns the cached payload { id, url, userId } or null if the link is unusable
export async function resolveLink(shortCode) {
  const key = cacheKey(shortCode);

  // 1. Cache-aside: Redis first
  const cached = await redis.get(key);
  if (cached === NOT_FOUND) return null;
  if (cached) return JSON.parse(cached);

  // 2. Fall back to MongoDB
  const link = await Link.findOne({ shortCode })
    .select("originalUrl user isActive isBlocked expiresAt")
    .lean();

  const expired = link?.expiresAt && link.expiresAt < new Date();
  if (!link || !link.isActive || link.isBlocked || expired) {
    // Negative caching stops bots hammering MongoDB with random codes
    await redis.set(key, NOT_FOUND, "EX", NEGATIVE_TTL);
    return null;
  }

  const payload = { id: String(link._id), url: link.originalUrl, userId: String(link.user) };

  // Never cache a link beyond its own expiry
  let ttl = CACHE_TTL;
  if (link.expiresAt) {
    ttl = Math.max(1, Math.min(ttl, Math.floor((link.expiresAt - Date.now()) / 1000)));
  }
  await redis.set(key, JSON.stringify(payload), "EX", ttl);
  return payload;
}

// Must be called whenever a link changes, otherwise redirects serve stale data
export function invalidateLink(shortCode) {
  return redis.del(cacheKey(shortCode));
}

export async function getOwnedLink(linkId, userId) {
  const link = await Link.findOne({ _id: linkId, user: userId });
  if (!link) throw new AppError("Link not found", 404);
  return link;
}
