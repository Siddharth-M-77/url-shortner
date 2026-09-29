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

// Short aliases people can put in a link, e.g. chhotulink.online/abc?s=wa
const SOURCE_ALIASES = {
  wa: "whatsapp",
  whatsapp: "whatsapp",
  ig: "instagram",
  insta: "instagram",
  instagram: "instagram",
  fb: "facebook",
  facebook: "facebook",
  yt: "youtube",
  youtube: "youtube",
  tg: "telegram",
  telegram: "telegram",
  x: "twitter",
  twitter: "twitter",
  li: "linkedin",
  linkedin: "linkedin",
  qr: "qr",
  sms: "sms",
  email: "email",
};

// Source written into the link itself: ?s=whatsapp or ?utm_source=whatsapp.
// This is the only reliable way to track apps that send no Referer (WhatsApp, iOS apps, email).
export function sourceFromQuery(query = {}) {
  const raw = [query.s, query.src, query.utm_source].find((v) => typeof v === "string" && v.trim());
  if (!raw) return null;
  const value = raw.trim().toLowerCase();
  if (SOURCE_ALIASES[value]) return SOURCE_ALIASES[value];
  // Unknown but harmless custom label, e.g. ?s=diwali-poster
  return /^[a-z0-9_-]{1,24}$/.test(value) ? value : null;
}

// In-app browsers name themselves in the user-agent even when they send no Referer
const IN_APP_BROWSERS = [
  [/Instagram/i, "instagram"],
  [/FBAN|FBAV|FB_IAB|FBIOS/i, "facebook"],
  [/LinkedInApp/i, "linkedin"],
  [/Snapchat/i, "snapchat"],
  [/Twitter/i, "twitter"],
  [/musical_ly|BytedanceWebview|TikTok/i, "tiktok"],
];

function sourceFromUserAgent(ua = "") {
  const match = IN_APP_BROWSERS.find(([re]) => re.test(ua));
  return match ? match[1] : null;
}

// Best guess of where a click came from: tag in the link > Referer header > in-app browser
export function detectSource(req) {
  const fromReferrer = normalizeReferrer(req.headers.referer);
  return (
    sourceFromQuery(req.query) ||
    (fromReferrer !== "direct" ? fromReferrer : null) ||
    sourceFromUserAgent(req.headers["user-agent"]) ||
    "direct"
  );
}

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
