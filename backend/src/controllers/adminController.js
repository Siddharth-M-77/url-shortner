import { Report } from "../models/Report.js";
import { Link } from "../models/Link.js";
import { User } from "../models/User.js";
import { invalidateLink } from "../services/linkService.js";
import { AppError } from "../utils/AppError.js";

export async function stats(_req, res) {
  const [users, links, openReports, clicksAgg] = await Promise.all([
    User.countDocuments(),
    Link.countDocuments(),
    Report.countDocuments({ status: "open" }),
    Link.aggregate([{ $group: { _id: null, clicks: { $sum: "$clicks" } } }]),
  ]);
  res.json({ users, links, openReports, totalClicks: clicksAgg[0]?.clicks || 0 });
}

export async function listReports(req, res) {
  const status = ["open", "actioned", "dismissed"].includes(req.query.status) ? req.query.status : "open";
  const reports = await Report.find({ status }).sort({ createdAt: -1 }).limit(100).lean();

  // Attach link + owner info so the admin can decide quickly
  const codes = reports.map((r) => r.shortCode);
  const links = await Link.find({ shortCode: { $in: codes } })
    .populate("user", "name email isBanned")
    .lean();
  const byCode = new Map(links.map((l) => [l.shortCode, l]));

  res.json({ reports: reports.map((r) => ({ ...r, link: byCode.get(r.shortCode) || null })) });
}

// action: "block" (block link), "ban" (block link + ban owner), "dismiss"
export async function resolveReport(req, res) {
  const { action } = req.body || {};
  if (!["block", "ban", "dismiss"].includes(action)) throw new AppError("Invalid action", 400);

  const report = await Report.findById(req.params.id);
  if (!report) throw new AppError("Report not found", 404);

  if (action !== "dismiss") {
    const link = await Link.findOneAndUpdate(
      { shortCode: report.shortCode },
      { isBlocked: true },
      { new: true }
    );
    if (link) {
      await invalidateLink(link.shortCode);
      if (action === "ban") {
        await User.updateOne({ _id: link.user }, { isBanned: true });
        // Block every link of a banned user and clear their cache entries
        const userLinks = await Link.find({ user: link.user }).select("shortCode").lean();
        await Link.updateMany({ user: link.user }, { isBlocked: true });
        await Promise.all(userLinks.map((l) => invalidateLink(l.shortCode)));
      }
    }
  }

  // Close all open reports for the same code in one go
  await Report.updateMany(
    { shortCode: report.shortCode, status: "open" },
    { status: action === "dismiss" ? "dismissed" : "actioned" }
  );
  res.json({ message: "Report resolved" });
}

// Manually set a user's plan (useful before Razorpay is wired up)
export async function setUserPlan(req, res) {
  const { plan, months = 1 } = req.body || {};
  if (!["free", "starter", "pro"].includes(plan)) throw new AppError("Invalid plan", 400);

  const planExpiresAt = plan === "free" ? null : new Date(Date.now() + Number(months) * 30 * 86_400_000);
  const user = await User.findByIdAndUpdate(req.params.id, { plan, planExpiresAt }, { new: true });
  if (!user) throw new AppError("User not found", 404);
  res.json({ user });
}

export async function listUsers(req, res) {
  const search = (req.query.search || "").toString().trim();
  const filter = search
    ? { email: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }
    : {};
  const users = await User.find(filter).sort({ createdAt: -1 }).limit(100).lean();
  res.json({ users });
}
