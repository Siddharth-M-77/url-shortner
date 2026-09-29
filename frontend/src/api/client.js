import axios from "axios";

// API origin + /api. On production the API lives on its own subdomain (api.chhotulink.online)
export const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

// withCredentials sends the httpOnly auth cookie on every request
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Extracts a human-readable message from any axios error
export function errorMessage(err) {
  return err?.response?.data?.message || err?.message || "Something went wrong";
}
