import axios from "axios";

// withCredentials sends the httpOnly auth cookie on every request
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

// Extracts a human-readable message from any axios error
export function errorMessage(err) {
  return err?.response?.data?.message || err?.message || "Something went wrong";
}
