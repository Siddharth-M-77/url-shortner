import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { getPlan } from "../config/plans.js";
import { AUTH_COOKIE, signToken } from "../middlewares/auth.js";
import { getUsage } from "../middlewares/quota.js";
import { AppError } from "../utils/AppError.js";

const cookieOptions = {
  httpOnly: true, // not readable from JS, protects against XSS token theft
  secure: env.isProd,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function sendAuth(res, user, status = 200) {
  res.cookie(AUTH_COOKIE, signToken(user._id), cookieOptions);
  res.status(status).json({ user });
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  const role = env.adminEmail && email.toLowerCase() === env.adminEmail ? "admin" : "user";
  const user = await User.create({ name, email, password, role });
  sendAuth(res, user, 201);
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  // Same message for both cases so attackers can't discover registered emails
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }
  if (user.isBanned) throw new AppError("This account has been suspended", 403);

  sendAuth(res, user);
}

export function logout(_req, res) {
  res.clearCookie(AUTH_COOKIE, { ...cookieOptions, maxAge: undefined });
  res.json({ message: "Logged out" });
}

export async function me(req, res) {
  const planKey = req.user.activePlan();
  const plan = getPlan(planKey);
  const usage = await getUsage(req.user._id);

  res.json({
    user: req.user,
    plan: {
      key: planKey,
      ...plan,
      // Infinity is not valid JSON, send null to mean "unlimited"
      linksPerMonth: plan.linksPerMonth === Infinity ? null : plan.linksPerMonth,
      trackedClicksPerMonth: plan.trackedClicksPerMonth === Infinity ? null : plan.trackedClicksPerMonth,
    },
    usage,
  });
}
