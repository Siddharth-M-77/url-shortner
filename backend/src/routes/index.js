import { Router } from "express";
import * as auth from "../controllers/authController.js";
import * as links from "../controllers/linkController.js";
import * as bio from "../controllers/bioController.js";
import * as admin from "../controllers/adminController.js";
import * as billing from "../controllers/billingController.js";
import { createReport } from "../controllers/reportController.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { checkLinkQuota } from "../middlewares/quota.js";
import { authLimiter, createLinkLimiter, reportLimiter } from "../middlewares/rateLimiters.js";
import {
  registerSchema,
  loginSchema,
  createLinkSchema,
  updateLinkSchema,
  bioPageSchema,
  reportSchema,
  subscribeSchema,
  verifyPaymentSchema,
} from "../utils/validators.js";
import { PLANS } from "../config/plans.js";

const router = Router();

// Auth
router.post("/auth/register", authLimiter, validate(registerSchema), auth.register);
router.post("/auth/login", authLimiter, validate(loginSchema), auth.login);
router.post("/auth/logout", auth.logout);
router.get("/auth/me", requireAuth, auth.me);

// Links (all require login)
router.get("/links/overview", requireAuth, links.overview);
router.get("/links", requireAuth, links.list);
router.post("/links", requireAuth, createLinkLimiter, validate(createLinkSchema), checkLinkQuota, links.create);
router.get("/links/:id", requireAuth, links.getOne);
router.patch("/links/:id", requireAuth, validate(updateLinkSchema), links.update);
router.delete("/links/:id", requireAuth, links.remove);
router.get("/links/:id/stats", requireAuth, links.stats);
router.get("/links/:id/qr", requireAuth, links.qr);

// Bio page
router.get("/bio/me", requireAuth, bio.getMine);
router.put("/bio/me", requireAuth, validate(bioPageSchema), bio.upsertMine);
router.get("/bio/public/:username", bio.getPublic);

// Billing (Razorpay). The webhook route is mounted in app.js with a raw body parser.
router.get("/billing", requireAuth, billing.overview);
router.post("/billing/subscribe", requireAuth, validate(subscribeSchema), billing.subscribe);
router.post("/billing/verify", requireAuth, validate(verifyPaymentSchema), billing.verify);
router.post("/billing/cancel", requireAuth, billing.cancel);

// Abuse reports (public)
router.post("/reports", reportLimiter, validate(reportSchema), createReport);

// Admin
router.get("/admin/stats", requireAuth, requireAdmin, admin.stats);
router.get("/admin/reports", requireAuth, requireAdmin, admin.listReports);
router.post("/admin/reports/:id/resolve", requireAuth, requireAdmin, admin.resolveReport);
router.get("/admin/users", requireAuth, requireAdmin, admin.listUsers);
router.patch("/admin/users/:id/plan", requireAuth, requireAdmin, admin.setUserPlan);

// Plans are public so the pricing page can render them
router.get("/plans", (_req, res) => {
  const plans = Object.entries(PLANS).map(([key, p]) => ({
    key,
    ...p,
    linksPerMonth: p.linksPerMonth === Infinity ? null : p.linksPerMonth,
    trackedClicksPerMonth: p.trackedClicksPerMonth === Infinity ? null : p.trackedClicksPerMonth,
  }));
  res.json({ plans });
});

export default router;
