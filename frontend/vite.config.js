import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { FAQS, FALLBACK_PLANS, PUBLIC_ROUTES } from "./src/content/site.js";

// Writes robots.txt and sitemap.xml into the build using VITE_SITE_URL
function seoFiles(siteUrl) {
  return {
    name: "linkzy-seo-files",
    apply: "build",
    generateBundle() {
      if (this.environment?.config?.build?.ssr) return; // only for the client build
      const today = new Date().toISOString().slice(0, 10);
      const urls = PUBLIC_ROUTES.map(
        (path) =>
          `  <url><loc>${siteUrl}${path === "/" ? "/" : path}</loc><lastmod>${today}</lastmod><priority>${path === "/" ? "1.0" : "0.5"}</priority></url>`,
      ).join("\n");

      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /links/\nDisallow: /bio\nDisallow: /billing\nDisallow: /admin\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      });
    },
  };
}

// Adds JSON-LD structured data (app + FAQ) to index.html so Google can show rich results
function structuredData(siteUrl) {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Linkzy",
      url: `${siteUrl}/`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "Free URL shortener for India with QR codes, click analytics and link-in-bio pages. Pay in rupees with UPI.",
      offers: FALLBACK_PLANS.map((p) => ({
        "@type": "Offer",
        name: `${p.name} plan`,
        price: String(p.price),
        priceCurrency: "INR",
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Linkzy",
      url: `${siteUrl}/`,
      logo: `${siteUrl}/logo.png`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return {
    name: "linkzy-structured-data",
    transformIndexHtml() {
      return data.map((json) => ({
        tag: "script",
        attrs: { type: "application/ld+json" },
        children: JSON.stringify(json),
        injectTo: "head",
      }));
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = (env.VITE_SITE_URL || "http://localhost:5173").replace(/\/$/, "");

  return {
    plugins: [react(), tailwindcss(), seoFiles(siteUrl), structuredData(siteUrl)],
    server: {
      port: 5173,
      // Proxy API calls in dev so cookies stay same-origin (no CORS cookie issues)
      proxy: {
        "/api": { target: "http://localhost:6011", changeOrigin: true },
      },
    },
  };
});
