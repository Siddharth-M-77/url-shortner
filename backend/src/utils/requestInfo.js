import { UAParser } from "ua-parser-js";

// Maps raw referrer hostnames to friendly source names shown in analytics
const SOURCE_MAP = [
  ["instagram", "instagram"],
  ["whatsapp", "whatsapp"],
  ["wa.me", "whatsapp"],
  ["facebook", "facebook"],
  ["fb.", "facebook"],
  ["t.co", "twitter"],
  ["twitter", "twitter"],
  ["x.com", "twitter"],
  ["linkedin", "linkedin"],
  ["lnkd.in", "linkedin"],
  ["youtube", "youtube"],
  ["google", "google"],
  ["telegram", "telegram"],
  ["t.me", "telegram"],
];

export function normalizeReferrer(referrer) {
  if (!referrer) return "direct";
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    const match = SOURCE_MAP.find(([needle]) => host.includes(needle));
    return match ? match[1] : host.replace(/^www\./, "");
  } catch {
    return "direct";
  }
}

export function parseUserAgent(uaString) {
  const ua = new UAParser(uaString || "").getResult();
  const type = ua.device.type;
  return {
    device: type === "mobile" || type === "tablet" ? type : "desktop",
    browser: ua.browser.name || "unknown",
    os: ua.os.name || "unknown",
  };
}

// Country comes from the Cloudflare header if you put Cloudflare in front,
// or from Nginx GeoIP (X-Country-Code). Falls back to "unknown".
export function getCountry(req) {
  return (
    req.headers["cf-ipcountry"] ||
    req.headers["x-country-code"] ||
    "unknown"
  ).toString().toUpperCase().slice(0, 7);
}

// Basic bot filter so crawlers/link previews don't inflate click counts
const BOT_REGEX = /bot|crawler|spider|preview|facebookexternalhit|whatsapp|slackbot|telegrambot|discordbot|curl|wget/i;
export function isBot(uaString) {
  return BOT_REGEX.test(uaString || "");
}
