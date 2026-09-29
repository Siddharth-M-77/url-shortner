import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Proxy API calls in dev so cookies stay same-origin (no CORS cookie issues)
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: true },
    },
  },
});
