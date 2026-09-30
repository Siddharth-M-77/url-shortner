// Turns each public route into static HTML after `vite build`, so the first paint
// needs no JavaScript and search engines read real content, title and description.
// Run via `npm run build` (it builds the SSR bundle first).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const { render } = await import(pathToFileURL(join(root, "node_modules/.prerender/entry-server.js")).href);
const { PUBLIC_ROUTES } = await import(pathToFileURL(join(root, "src/content/site.js")).href);

const template = readFileSync(join(dist, "index.html"), "utf8");
const escapeAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function setMeta(html, attr, key, value) {
  if (value === undefined) return html;
  const re = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`);
  return html.replace(re, `$1${escapeAttr(value)}$2`);
}

for (const route of PUBLIC_ROUTES) {
  const { html: appHtml, head } = render(route);
  let page = template;

  if (head) {
    page = page.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(head.title)}</title>`);
    page = setMeta(page, "name", "description", head.description);
    page = setMeta(page, "name", "robots", head.robots);
    page = setMeta(page, "property", "og:title", head.title);
    page = setMeta(page, "property", "og:description", head.description);
    page = setMeta(page, "property", "og:url", head.url);
    page = setMeta(page, "name", "twitter:title", head.title);
    page = setMeta(page, "name", "twitter:description", head.description);
    if (head.url) page = page.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${head.url}$2`);
  }

  // If the server falls back to this file for another URL (e.g. /dashboard served
  // index.html), drop the prerendered markup so the wrong page never flashes.
  const guard = `<script>(function(){var p=location.pathname.replace(/\\/+$/,"")||"/";if(p!==${JSON.stringify(route)})document.getElementById("root").innerHTML=""})()</script>`;
  page = page.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>${guard}`);

  const out = route === "/" ? join(dist, "index.html") : join(dist, route.slice(1), "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, page);
  console.log(`prerendered ${route.padEnd(10)} -> ${out.replace(root + "/", "")}  (${Math.round(appHtml.length / 1024)} KB)`);
}
