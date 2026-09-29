import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";

export const AUTH_COOKIE = "token";

// Reads the JWT from an httpOnly cookie (preferred) or the Authorization header
export async function requireAuth(req, _res, next) {
  const header = req.headers.authorization;
  const token = req.cookies?.[AUTH_COOKIE] || (header?.startsWith("Bearer ") ? header.slice(7) : null);

  if (!token) throw new AppError("Please log in to continue", 401);

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new AppError("Session expired, please log in again", 401);
  }

  const user = await User.findById(payload.id);
  if (!user) throw new AppError("Account not found", 401);
  if (user.isBanned) throw new AppError("This account has been suspended", 403);

  req.user = user;
  next();
}

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== "admin") throw new AppError("Admin access only", 403);
  next();
}

export function signToken(userId) {
  return jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}
