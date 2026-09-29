import { env } from "../config/env.js";

export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Central error handler: operational errors are shown, everything else is hidden in prod
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  // Mongo duplicate key (e.g. email or alias already taken)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "value";
    const label = field === "shortCode" ? "alias" : field;
    return res.status(409).json({ message: `This ${label} is already taken` });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid id" });
  }

  const status = err.status || 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    message: err.isOperational || !env.isProd ? err.message : "Something went wrong",
  });
}
