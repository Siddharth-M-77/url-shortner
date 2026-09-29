import { env } from "../config/env.js";
import { AppError } from "./AppError.js";

// Domains we never allow as targets (our own domain would create redirect loops)
const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

export function assertValidUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new AppError("Please enter a valid URL (include https://)", 400);
  }

  // Block javascript:, data:, file: etc. to prevent XSS through redirects
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new AppError("Only http and https links are allowed", 400);
  }

  const ownHost = new URL(env.baseUrl).hostname;
  if (parsed.hostname === ownHost && env.isProd) {
    throw new AppError("You cannot shorten links from this domain", 400);
  }
  if (env.isProd && BLOCKED_HOSTS.has(parsed.hostname)) {
    throw new AppError("This URL is not allowed", 400);
  }

  return parsed.toString();
}

// Checks the URL against Google Safe Browsing. Skipped when no key is configured.
export async function assertNotMalicious(url) {
  if (!env.safeBrowsingKey) return;

  try {
    const res = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${env.safeBrowsingKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: { clientId: "linkzy", clientVersion: "1.0.0" },
          threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }],
          },
        }),
        signal: AbortSignal.timeout(3000),
      }
    );
    const data = await res.json();
    if (data.matches?.length) {
      throw new AppError("This URL was flagged as unsafe and cannot be shortened", 400);
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    // If Google is down we don't block users; log and move on
    console.error("Safe Browsing check failed:", err.message);
  }
}
