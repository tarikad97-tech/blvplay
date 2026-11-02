
import { createServer } from "vite";
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");
const site = (process.env.SITE_URL || "https://blvplay.site")
  .trim()
  .replace(/\/+$/, "");

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

const absoluteUrl = (path) =>
  path.startsWith("http")
    ? path
    : `${site}${path.startsWith("/") ? "" : "/"}${path}`;

const formatDate = (iso) =>
  new Intl.DateTimeFormat("ar-MA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));

function renderImage(image, cover = false) {
  if (!image?.src) return "";

  return `
    <figure class="${cover ? "afig afig--cover" : "afig"}">
      <img
        class="afig__img"
        src="${escapeHtml(image.src)}"
        alt="${escapeHtml(image.alt || "")}"
        width="${Number(image.width) || 1600}"
        height="${Number(image.height) || 900}"
        loading="${cover ? "eager" : "lazy"}"
        decoding="async"
      />
      ${image.caption
        ? `<figcaption class="afig__cap">${escapeHtml(image.caption)}</figcaption>`
        : ""}
    </figure>
  `;
}

function renderArticle(article, getArticle) {
  const related = (article.related || [])
    .map(getArticle)
    .filter(Boolean);

  const sections = (article.sections || [])
    .map((section) => `
      <section>
        <h2>${escapeHtml(section.heading)}</h2>
        ${section.image ? renderImage(section.image) : ""}
        ${(section.paragraphs || [])
          .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
          .join("\n")}
      </section>
    `)
    .join("\n");

  const relatedHtml = related.length
    ? `
      <aside class="related">
        <h2>مقالات ذات صلة</h2>
        <ul>
          ${related.map((item) => `
            <li>
              <a class="link" href="/football/${encodeURIComponent(item.slug)}">
                ${escapeHtml(item.title)}
              </a>
            </li>
          `).join("")}
        </ul>
        <p>
          <a href="/play" class="btn btn--primary">جرّب تحدياً الآن</a>
        </p>
      </aside>
    `
    : "";

  return `
    <div class="container page prose">
      <p><a href="/football" class="link">← مركز المقالات</a></p>
      <h1>${escapeHtml(article.title)}</h1>
      <p class="muted">
        <span class="chip">${escapeHtml(article.category)}</span>
        <time datetime="${escapeHtml(article.date)}">${formatDate(article.date)}</time>
      </p>
      ${article.image ? renderImage(article.image, true) : ""}
      ${sections}
      ${relatedHtml}
    </div>
  `;
}

function replaceMeta(html, attribute, key, value) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const pattern = new RegExp(
    `<meta\\s+${attribute}=["']${escapedKey}["'][^>]*>`,
    "i"
  );

  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`;

  return pattern.test(html)
    ? html.replace(pattern, tag)
    : html.replace("</head>", `  ${tag}\n  </head>`);
}

function prepareHtml(template, article, articlesBySlug) {
  const url = `${site}/football/${article.slug}`;
  const description = article.excerpt || article.title;
  const image = absoluteUrl(article.image?.src || "/og-image.png");

  let html = template.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(article.title)} | BLV Play</title>`
  );

  html = html.replace(
    /<link\s+rel=["']canonical["'][^>]*>/i,
    ""
  );

  html = html.replace(
    "</head>",
    `  <link rel="canonical" href="${url}" />\n  </head>`
  );

  html = replaceMeta(html, "name", "description", description);
  html = replaceMeta(html, "property", "og:type", "article");
  html = replaceMeta(html, "property", "og:title", article.title);
  html = replaceMeta(html, "property", "og:description", description);
  html = replaceMeta(html, "property", "og:url", url);
  html = replaceMeta(html, "property", "og:image", image);
  html = replaceMeta(
    html,
    "property",
    "og:image:alt",
    article.image?.alt || article.title
  );
  html = replaceMeta(html, "name", "twitter:card", "summary_large_image");
  html = replaceMeta(html, "name", "twitter:title", article.title);
  html = replaceMeta(html, "name", "twitter:description", description);
  html = replaceMeta(html, "name", "twitter:image", image);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description,
    datePublished: article.date,
    inLanguage: "ar",
    mainEntityOfPage: url,
    image: article.image ? [image] : undefined,
    articleSection: article.category,
    publisher: {
      "@type": "Organization",
      name: "BLV Play",
      url: site,
    },
  };

  html = html.replace(
    "</head>",
    `  <script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>\n  </head>`
  );

  const content = renderArticle(
    article,
    (slug) => articlesBySlug.get(slug)
  );

  if (!html.includes('<div id="root"></div>')) {
    throw new Error("لم يتم العثور على عنصر root في dist/index.html");
  }

  return html.replace(
    '<div id="root"></div>',
    `<div id="root" data-prerendered="true">${content}</div>`
  );
}


function prepareFootballIndexHtml(template, articles) {
  const title = "مركز المقالات | أخبار وتحليلات كرة القدم | BLV Play";
  const description =
    "أخبار وتحليلات كرة القدم المغربية: المنتخب والبطولة الاحترافية وكأس أمم أفريقيا، إضافة إلى أدلة استخدام تحديات BLV Play.";

  const sorted = [...articles].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const cardsHtml = sorted
    .map((article, index) => {
      const url = `/football/${encodeURIComponent(article.slug)}`;

      const cover = article.image?.src
        ? `
          <img
            src="${escapeHtml(article.image.src)}"
            alt=""
            width="${Number(article.image.width) || 1600}"
            height="${Number(article.image.height) || 900}"
            loading="lazy"
            decoding="async"
          />
        `
        : `
          <div class="acard__cover-fallback">
            ${escapeHtml(article.category)}
          </div>
        `;

      const paragraphs = (article.sections || [])
        .flatMap((section) => section.paragraphs || []);

      const wordCount = paragraphs.join(" ").trim().split(/\s+/).filter(Boolean).length;
      const readingTime = `${Math.max(1, Math.ceil(wordCount / 200))} دقائق قراءة`;

      return `
        <article class="${index === 0 ? "acard acard--featured" : "acard"}">
          <div class="acard__cover">
            ${cover}
          </div>

          <div class="acard__body">
            <div class="acard__meta">
              <span class="acard__chip">${escapeHtml(article.category)}</span>
              <time datetime="${escapeHtml(article.date)}">
                ${escapeHtml(formatDate(article.date))}
              </time>
            </div>

            <h2 class="acard__title">
              <a class="acard__link" href="${url}">
                ${escapeHtml(article.title)}
              </a>
            </h2>

            <p class="acard__excerpt">
              ${escapeHtml(article.excerpt || "")}
            </p>

            <div class="acard__foot">
              <span>${readingTime}</span>
              <span class="acard__more" aria-hidden="true">
                اقرأ المقال ←
              </span>
            </div>
          </div>
        </article>
      `;
    })
    .join("\n");

  let html = template.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(title)}</title>`
  );

  html = html.replace(
    /<link\s+rel=["']canonical["'][^>]*>/i,
    ""
  );

  html = html.replace(
    "</head>",
    `  <link rel="canonical" href="${site}/football" />\n  </head>`
  );

  html = replaceMeta(html, "name", "description", description);
  html = replaceMeta(html, "property", "og:title", title);
  html = replaceMeta(html, "property", "og:description", description);
  html = replaceMeta(html, "property", "og:url", `${site}/football`);
  html = replaceMeta(html, "property", "og:type", "website");

  if (!html.includes('<div id="root"></div>')) {
    throw new Error("لم يتم العثور على عنصر root في dist/index.html");
  }

  const content = `
    <main class="container page">
      <h1>مركز المقالات</h1>
      <p class="lead">
        أخبار الكرة المغربية وتحليلاتها، وأدلة عملية للاستفادة من التحديات.
      </p>

      <div class="agrid">
        ${cardsHtml}
      </div>
    </main>
  `;

  return html.replace(
    '<div id="root"></div>',
    `<div id="root" data-prerendered="true">${content}</div>`
  );
}


let vite;

try {
  vite = await createServer({
    configFile: resolve(root, "vite.config.ts"),
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "error",
  });

  const module = await vite.ssrLoadModule("/src/data/articles.ts");
  const articles = module.ARTICLES;

  if (!Array.isArray(articles) || articles.length === 0) {
    throw new Error("لم يتم العثور على المقالات في ARTICLES");
  }

  const articlesBySlug = new Map(
    articles.map((article) => [article.slug, article])
  );

  const template = readFileSync(
    resolve(dist, "index.html"),
    "utf8"
  );

  for (const article of articles) {
    if (!article.slug || !article.title || !article.sections) {
      console.warn(
        `تم تجاوز مقال غير مكتمل: ${article.slug || "بدون slug"}`
      );
      continue;
    }

    const outputDir = resolve(dist, "football", article.slug);
    mkdirSync(outputDir, { recursive: true });

    const html = prepareHtml(template, article, articlesBySlug);

    writeFileSync(
      resolve(outputDir, "index.html"),
      html,
      "utf8"
    );

    console.log(`Generated: /football/${article.slug}/`);
  }
const footballHtml = prepareFootballIndexHtml(
  template,
  articles
);

const footballDir = resolve(dist, "football");

mkdirSync(footballDir, { recursive: true });

writeFileSync(
  resolve(footballDir, "index.html"),
  footballHtml,
  "utf8"
);

console.log("Generated: /football/");
  console.log(`\nتم توليد ${articles.length} صفحة مقال بنجاح.`);
} catch (error) {
  console.error("فشل توليد صفحات المقالات:", error);
  process.exitCode = 1;
} finally {
  if (vite) {
    await vite.close();
  }
}
