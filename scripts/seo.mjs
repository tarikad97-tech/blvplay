// Generates public/sitemap.xml and public/robots.txt before a build.
// Set SITE_URL (e.g. https://blvplay.example) so the sitemap has absolute URLs.
// Without it, robots.txt is still written but the sitemap is skipped (a sitemap needs absolute URLs).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const site = (process.env.SITE_URL || "").replace(/\/+$/, "");
const pages = [
  "/", "/challenges", "/create", "/play", "/how-it-works", "/about", "/contact",
  "/football", "/faq", "/privacy-policy", "/terms", "/cookie-policy"
];
const articles = readFileSync(new URL("../src/data/articles.ts", import.meta.url), "utf8");
for (const m of articles.matchAll(/slug:\s*"([^"]+)"/g)) pages.push(`/football/${m[1]}`);
// Challenge pages (/play/:id, /create/:id) are interactive screens, not content pages: left out on purpose.

mkdirSync(new URL("../public/", import.meta.url), { recursive: true });
const robots = ["User-agent: *", "Allow: /", "Disallow: /results", "Disallow: /legend/", ""];
if (site) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
    .map((p) => `  <url><loc>${site}${p}</loc></url>`)
    .join("\n")}\n</urlset>\n`;
  writeFileSync(new URL("../public/sitemap.xml", import.meta.url), xml);
  robots.push(`Sitemap: ${site}/sitemap.xml`, "");
} else {
  console.warn("SITE_URL is not set: sitemap.xml was not generated.");
}
writeFileSync(new URL("../public/robots.txt", import.meta.url), robots.join("\n"));
