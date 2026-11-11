import React from "react";
import { renderToString } from "react-dom/server";
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

const pages = [
  {
    path: "/",
    title: "BLV Play — أخبار كرة القدم المغربية وتحديات تفاعلية",
    description:
      "اكتشف أخبار كرة القدم المغربية وتحليلاتها، وشارك في تحديات تفاعلية ممتعة لعشاق كرة القدم.",
  },
  {
    path: "/challenges",
    title: "تحديات كرة القدم التفاعلية | BLV Play",
    description:
      "اكتشف تحديات كرة القدم التفاعلية، واختر وضع اللعب دون كاميرا أو وضع التصوير عندما يكون متاحًا.",
  },
  {
    path: "/create",
    title: "صانع المحتوى — صوّر تحديك | BLV Play",
    description:
      "اختر تحدياً وصوّر مشاركتك بالكاميرا والميكروفون لإنتاج فيديو عمودي جاهز لـ Reels وTikTok وShorts.",
  },
  {
    path: "/play",
    title: "وضع المشجع — العب بدون تصوير | BLV Play",
    description:
      "العب تحديات كرة القدم دون كاميرا: اختر لاعبيك، ابنِ تشكيلتك، وانتهِ ببطاقة نتيجة تشاركها.",
  },
  {
    path: "/how-it-works",
    title: "كيف تعمل المنصة | BLV Play",
    description:
      "تعرف على طريقة استخدام BLV Play، واكتشف خطوات المشاركة في تحديات كرة القدم ووضع اللعب المناسب لك.",
  },
  {
    path: "/about",
    title: "من نحن | BLV Play",
    description:
      "تعرف على BLV Play، ومهمتنا في تقديم محتوى كرة قدم وتحديات تفاعلية لعشاق اللعبة.",
  },
  {
    path: "/contact",
    title: "اتصل بنا | BLV Play",
    description:
      "تواصل مع فريق BLV Play لإرسال اقتراح أو الإبلاغ عن مشكلة أو تقديم طلب يخص الخصوصية.",
  },
  {
    path: "/faq",
    title: "الأسئلة الشائعة | BLV Play",
    description:
      "إجابات عن الأسئلة الشائعة حول تحديات BLV Play، والتصوير، والخصوصية، وطريقة اللعب.",
  },
  {
    path: "/privacy-policy",
    title: "سياسة الخصوصية | BLV Play",
    description:
      "تعرف على كيفية تعامل BLV Play مع البيانات والخصوصية والتخزين داخل الموقع.",
  },
  {
    path: "/terms",
    title: "شروط الاستخدام | BLV Play",
    description:
      "اقرأ شروط استخدام موقع BLV Play والمقالات وتحديات كرة القدم التفاعلية.",
  },
  {
    path: "/cookie-policy",
    title: "سياسة ملفات تعريف الارتباط | BLV Play",
    description:
      "تعرف على استخدام ملفات تعريف الارتباط والتقنيات المشابهة في موقع BLV Play.",
  },
];

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

function setMeta(html, attribute, key, value) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<meta\\s+${attribute}=["']${escapedKey}["'][^>]*>`,
    "i"
  );

  const tag =
    `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`;

  return pattern.test(html)
    ? html.replace(pattern, tag)
    : html.replace("</head>", `  ${tag}\n  </head>`);
}

function preparePageHtml(template, page, renderedContent) {
  const url = `${site}${page.path === "/" ? "/" : page.path}`;
  const image = `${site}/og-image.png`;

  let html = template.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(page.title)}</title>`
  );

  html = html.replace(
    /<link\s+rel=["']canonical["'][^>]*>/i,
    ""
  );

  html = html.replace(
    "</head>",
    `  <link rel="canonical" href="${escapeHtml(url)}" />\n  </head>`
  );

  html = setMeta(html, "name", "description", page.description);
  html = setMeta(html, "property", "og:type", "website");
  html = setMeta(html, "property", "og:title", page.title);
  html = setMeta(html, "property", "og:description", page.description);
  html = setMeta(html, "property", "og:url", url);
  html = setMeta(html, "property", "og:image", image);
  html = setMeta(html, "name", "twitter:card", "summary_large_image");
  html = setMeta(html, "name", "twitter:title", page.title);
  html = setMeta(html, "name", "twitter:description", page.description);
  html = setMeta(html, "name", "twitter:image", image);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url,
    inLanguage: "ar",
    isPartOf: {
      "@type": "WebSite",
      name: "BLV Play",
      url: site,
    },
  };

  html = html.replace(
    "</head>",
    `  <script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>\n  </head>`
  );

  if (!html.includes('<div id="root"></div>')) {
    throw new Error(
      `لم يتم العثور على عنصر root عند توليد الصفحة: ${page.path}`
    );
  }

  return html.replace(
    '<div id="root"></div>',
    `<div id="root" data-prerendered="true">${renderedContent}</div>`
  );
}

let vite;

try {
  // بيئة متوافقة مع بعض المكونات التي تفحص window أثناء العرض الأول.
  globalThis.window = {
    location: {
      pathname: "/",
      search: "",
      href: site,
    },
    matchMedia: () => ({
      matches: false,
      media: "",
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() {
        return false;
      },
    }),
    addEventListener() {},
    removeEventListener() {},
  };

  vite = await createServer({
    configFile: resolve(root, "vite.config.ts"),
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "error",
  });

  const appModule = await vite.ssrLoadModule("/src/App.tsx");
  const routerModule = await vite.ssrLoadModule("/src/lib/router.tsx");

  if (!appModule.App || !routerModule.Router) {
    throw new Error("تعذر تحميل App أو Router");
  }

  const template = readFileSync(
    resolve(dist, "index.html"),
    "utf8"
  );

  for (const page of pages) {
    // تحديد المسار قبل إنشاء Router حتى يعرض المكوّن الصفحة المطلوبة.
    window.location.pathname = page.path;
    window.location.href = `${site}${page.path}`;

    const app = React.createElement(appModule.App);
    const tree = React.createElement(
      routerModule.Router,
      null,
      app
    );

    const content = renderToString(tree);
    const html = preparePageHtml(template, page, content);

    const outputDir =
      page.path === "/"
        ? dist
        : resolve(dist, page.path.slice(1));

    mkdirSync(outputDir, { recursive: true });

    writeFileSync(
      resolve(outputDir, "index.html"),
      html,
      "utf8"
    );

    console.log(`Generated: ${page.path}`);
  }

  console.log(`\nتم توليد ${pages.length} صفحة عامة بنجاح.`);
} catch (error) {
  console.error("\nفشل توليد الصفحات العامة:", error);
  process.exitCode = 1;
} finally {
  if (vite) {
    await vite.close();
  }
}
