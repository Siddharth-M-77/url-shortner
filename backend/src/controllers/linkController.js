import QRCode from "qrcode";
import { Link } from "../models/Link.js";
import { Click } from "../models/Click.js";
import { redis } from "../config/redis.js";
import { env } from "../config/env.js";
import {
  createLink,
  getOwnedLink,
  invalidateLink,
} from "../services/linkService.js";
import { getLinkStats, getUserOverview } from "../services/analyticsService.js";
import { assertValidUrl, assertNotMalicious } from "../utils/urlSafety.js";

const shortUrl = (code) => `${env.baseUrl}/${code}`;

function serialize(link) {
  const obj = link.toJSON ? link.toJSON() : link;
  return { ...obj, shortUrl: shortUrl(obj.shortCode) };
}

export async function create(req, res) {
  try {
    const link = await createLink({ user: req.user, ...req.body });
    res.status(201).json({ link: serialize(link) });
  } catch (err) {
    // Creation failed, give the monthly quota slot back
    if (req.quotaKey) await redis.decr(req.quotaKey);
    throw err;
  }
}

export async function list(req, res) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const search = (req.query.search || "").toString().trim();

  const filter = { user: req.user._id };
  if (search) {
    // Escape regex special characters from user input
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { title: { $regex: safe, $options: "i" } },
      { originalUrl: { $regex: safe, $options: "i" } },
      { shortCode: { $regex: safe, $options: "i" } },
    ];
  }

  const [links, total] = await Promise.all([
    Link.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Link.countDocuments(filter),
  ]);

  res.json({
    links: links.map(serialize),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function getOne(req, res) {
  const link = await getOwnedLink(req.params.id, req.user._id);
  res.json({ link: serialize(link) });
}

export async function update(req, res) {
  const link = await getOwnedLink(req.params.id, req.user._id);
  const { originalUrl, title, isActive } = req.body;

  if (originalUrl !== undefined) {
    const clean = assertValidUrl(originalUrl);
    await assertNotMalicious(clean);
    link.originalUrl = clean;
  }
  if (title !== undefined) link.title = title;
  if (isActive !== undefined) link.isActive = isActive;

  await link.save();
  await invalidateLink(link.shortCode); // redirect must pick up the change immediately
  res.json({ link: serialize(link) });
}

export async function remove(req, res) {
  const link = await getOwnedLink(req.params.id, req.user._id);
  await Promise.all([
    link.deleteOne(),
    Click.deleteMany({ link: link._id }),
    invalidateLink(link.shortCode),
  ]);
  res.json({ message: "Link deleted" });
}

export async function stats(req, res) {
  const link = await getOwnedLink(req.params.id, req.user._id);
  const days = Math.min(365, Math.max(1, Number(req.query.days) || 30));
  const data = await getLinkStats(link._id, days);
  res.json({ link: serialize(link), stats: data });
}

export async function overview(req, res) {
  const [data, totalLinks, clicksAgg] = await Promise.all([
    getUserOverview(req.user._id, 30),
    Link.countDocuments({ user: req.user._id }),
    Link.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, clicks: { $sum: "$clicks" } } },
    ]),
  ]);
  res.json({ totalLinks, totalClicks: clicksAgg[0]?.clicks || 0, ...data });
}

// Returns a PNG (default) or SVG QR code for the short link
export async function qr(req, res) {
  const link = await getOwnedLink(req.params.id, req.user._id);
  const format = req.query.format === "svg" ? "svg" : "png";
  const size = Math.min(1024, Math.max(128, Number(req.query.size) || 512));
  const options = { width: size, margin: 2, errorCorrectionLevel: "M" };

  res.setHeader("Content-Disposition", `attachment; filename="qr-${link.shortCode}.${format}"`);

  if (format === "svg") {
    res.type("image/svg+xml").send(await QRCode.toString(shortUrl(link.shortCode), { ...options, type: "svg" }));
  } else {
    res.type("image/png").send(await QRCode.toBuffer(shortUrl(link.shortCode), options));
  }
}
