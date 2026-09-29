import mongoose from "mongoose";
import { Click } from "../models/Click.js";

// Groups clicks by a field and returns the top N, e.g. [{ key: "instagram", count: 42 }]
async function topBy(match, field, limit = 8) {
  const rows = await Click.aggregate([
    { $match: match },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
  return rows.map((r) => ({ key: r._id, count: r.count }));
}

// Daily click counts for the last `days` days, zero-filled so charts have no gaps
async function dailySeries(match, days) {
  const rows = await Click.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" } },
        count: { $sum: 1 },
      },
    },
  ]);
  const byDay = new Map(rows.map((r) => [r._id, r.count]));

  const series = [];
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = formatter.format(new Date(Date.now() - i * 86_400_000));
    series.push({ date: day, count: byDay.get(day) || 0 });
  }
  return series;
}

export async function getLinkStats(linkId, days = 30) {
  const since = new Date(Date.now() - days * 86_400_000);
  const match = { link: new mongoose.Types.ObjectId(linkId), createdAt: { $gte: since } };

  const [daily, referrers, devices, browsers, countries, total] = await Promise.all([
    dailySeries(match, days),
    topBy(match, "referrer"),
    topBy(match, "device"),
    topBy(match, "browser"),
    topBy(match, "country"),
    Click.countDocuments(match),
  ]);

  return { days, trackedClicks: total, daily, referrers, devices, browsers, countries };
}

export async function getUserOverview(userId, days = 30) {
  const since = new Date(Date.now() - days * 86_400_000);
  const match = { user: new mongoose.Types.ObjectId(userId), createdAt: { $gte: since } };

  const [daily, referrers] = await Promise.all([dailySeries(match, days), topBy(match, "referrer", 5)]);
  return { days, daily, referrers };
}
