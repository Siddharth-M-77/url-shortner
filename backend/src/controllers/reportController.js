import { Report } from "../models/Report.js";

// Anyone can report a suspicious short link (no login required)
export async function createReport(req, res) {
  await Report.create({ ...req.body, reporterIp: req.ip });
  res.status(201).json({ message: "Thanks, our team will review this link" });
}
