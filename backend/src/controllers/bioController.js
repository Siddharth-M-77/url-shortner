import { BioPage } from "../models/BioPage.js";
import { getPlan } from "../config/plans.js";
import { assertValidUrl } from "../utils/urlSafety.js";
import { AppError } from "../utils/AppError.js";

export async function getMine(req, res) {
  const page = await BioPage.findOne({ user: req.user._id });
  res.json({ page });
}

// Create or update the logged-in user's bio page
export async function upsertMine(req, res) {
  const plan = getPlan(req.user.activePlan());
  if (!plan.bioPage) throw new AppError("Bio pages are not available on your plan", 403);

  const data = { ...req.body };
  if (data.links) {
    data.links = data.links.map((l) => ({ label: l.label, url: assertValidUrl(l.url) }));
  }

  // Make sure the username is not taken by someone else
  const taken = await BioPage.findOne({ username: data.username, user: { $ne: req.user._id } }).lean();
  if (taken) throw new AppError("This username is already taken", 409);

  const page = await BioPage.findOneAndUpdate(
    { user: req.user._id },
    { $set: { ...data, user: req.user._id } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  res.json({ page });
}

// Public endpoint used by the /@username page, no login needed
export async function getPublic(req, res) {
  const username = req.params.username.toLowerCase();
  const page = await BioPage.findOneAndUpdate(
    { username },
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate("user", "plan planExpiresAt isBanned")
    .lean();

  if (!page || page.user?.isBanned) throw new AppError("Page not found", 404);

  const planKey =
    page.user.plan !== "free" && page.user.planExpiresAt && new Date(page.user.planExpiresAt) < new Date()
      ? "free"
      : page.user.plan;

  const { user: _user, views: _views, ...publicData } = page;
  res.json({ page: publicData, showBranding: !getPlan(planKey).removeBranding });
}
