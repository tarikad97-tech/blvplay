
// Generates public/sitemap.xml and public/robots.txt before a build.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const site = (process.env.SITE_URL || "https://blvplay.site")
  .trim()
  .replace(/\/+$/, "");

const pages = [
  "/",
  "/challenges/",
  "/create/",
  "/play/",
  "/how-it-works/",
  "/about/",
  "/contact/",
  "/football/",
  "/faq/",
  "/privacy-policy/",
  "/terms/",
  "/cookie-policy/",
];

// Read article slugs from both article files.
const articleFiles = [
  "../src/data/articles.ts",
  "../src/data/moroccoArticles.ts",
];

for (const file of articleFiles) {
  const content = readFileSync(
    new URL(file, import.meta.url),
    "utf8"
  );

  for (const match of content.matchAll(/slug:\s*["']([^"']+)["']/g)) {
    const slug = match[1].trim();

    if (slug) {
      pages.push(`/football/${slug}/`);
    }
  }
}

// Remove duplicate URLs.
const uniquePages = [...new Set(pages)];

mkdirSync(new URL("../public/", import.meta.url), {
  recursive: true,
});

const robots = [
  "User-agent: *",
  "Allow: /",
  "Disallow: /results",
  "Disallow: /legend/",
  `Sitemap: ${site}/sitemap.xml`,
  "",
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniquePages
  .map((page) => `  <url><loc>${site}${page}</loc></url>`)
  .join("\n")}
</urlset>
`;

writeFileSync(
  new URL("../public/sitemap.xml", import.meta.url),
  xml
);

writeFileSync(
  new URL("../public/robots.txt", import.meta.url),
  robots.join("\n")
);

console.log(`Sitemap generated successfully: ${uniquePages.length} URLs`);
console.log("Included article files:", articleFiles.join(", "));

