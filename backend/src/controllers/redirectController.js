import { resolveLink } from "../services/linkService.js";
import { enqueueClick } from "../queues/clickQueue.js";
import { env } from "../config/env.js";
import {
  getCountry,
  isBot,
  normalizeReferrer,
  parseUserAgent,
} from "../utils/requestInfo.js";

const CODE_REGEX = /^[a-zA-Z0-9_-]{4,30}$/;

// Hot path: keep this as lean as possible. One Redis GET on cache hit.
export async function redirect(req, res) {
  const { code } = req.params;
  if (!CODE_REGEX.test(code)) {
    return res.redirect(302, `${env.clientUrl}/not-found`);
  }

  const link = await resolveLink(code);
  if (!link) {
    return res.redirect(302, `${env.clientUrl}/not-found`);
  }

  const ua = req.headers["user-agent"];
  if (!isBot(ua)) {
    enqueueClick({
      linkId: link.id,
      userId: link.userId,
      referrer: normalizeReferrer(req.headers.referer),
      country: getCountry(req),
      at: Date.now(),
      ...parseUserAgent(ua),
    });
  }

  // 302 (not 301) so browsers don't cache the redirect and every click is counted
  res.set("Cache-Control", "private, max-age=0, no-store");
  res.set("Referrer-Policy", "unsafe-url");
  return res.redirect(302, link.url);
}
