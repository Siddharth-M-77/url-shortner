import { useEffect } from "react";

const DEFAULT_TITLE = "Free URL Shortener for India – Short Links, QR Codes & Bio Pages | Linkzy";
const SITE_URL = (
  import.meta.env.VITE_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")
).replace(/\/$/, "");

// During prerender (SSR) effects don't run, so the page's SEO values are collected here
// and written into the static HTML by scripts/prerender.mjs.
let ssrHead = null;
export function takeSsrHead() {
  const head = ssrHead;
  ssrHead = null;
  return head;
}

function headValues({ title, description, path, noindex }) {
  return {
    title: title ? `${title} | Linkzy` : DEFAULT_TITLE,
    description,
    url: path !== undefined ? `${SITE_URL}${path}` : undefined,
    robots: noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large",
  };
}

function setMeta(selector, attr, key, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

// Sets the page title, description, canonical URL and robots tag for the current route
export function useSeo({ title, description, path, noindex = false } = {}) {
  if (import.meta.env.SSR) ssrHead = headValues({ title, description, path, noindex });

  useEffect(() => {
    const fullTitle = title ? `${title} | Linkzy` : DEFAULT_TITLE;
    document.title = fullTitle;
    setMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);

    if (description) {
      setMeta('meta[name="description"]', "name", "description", description);
      setMeta('meta[property="og:description"]', "property", "og:description", description);
      setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    }

    setMeta('meta[name="robots"]', "name", "robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");

    if (path !== undefined) {
      const url = `${SITE_URL}${path}`;
      let link = document.head.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = url;
      setMeta('meta[property="og:url"]', "property", "og:url", url);
    }
  }, [title, description, path, noindex]);
}
