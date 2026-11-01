import { useId, useState } from "react";
import type { Article } from "../data/articles";
import { Link } from "../lib/router";
import "../styles/home.css";
import "../styles/article.css";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("ar-MA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/** زمن القراءة التقريبي بحسب عدد كلمات المقال (180 كلمة في الدقيقة). */
function readingTime(article: Article): string {
  const words = article.sections
    .flatMap((section) => section.paragraphs)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

  const minutes = Math.max(1, Math.round(words / 180));

  if (minutes === 1) return "دقيقة قراءة";
  if (minutes === 2) return "دقيقتا قراءة";
  if (minutes <= 10) return `${minutes} دقائق قراءة`;
  return `${minutes} دقيقة قراءة`;
}

/* ألوان الغلاف لكل تصنيف: [بداية التدرج، نهايته] */
const PALETTE: Record<string, [string, string]> = {
  "المنتخب المغربي": ["#a3182f", "#0f3d26"],
  "البطولة الوطنية": ["#d99a1d", "#2a1c05"],
  "كأس أمم أفريقيا": ["#0f7a45", "#06150e"],
  "دليل الاستخدام": ["#0e7490", "#071a24"],
  "تحليل التشكيلات": ["#4f46e5", "#0b0f2e"],
  default: ["#14532d", "#07110d"],
};

function Ball() {
  return (
    <g>
      <circle cx="200" cy="110" r="46" fill="#ffffff" fillOpacity="0.96" />
      <polygon
        points="200,93 216.2,104.8 210,123.8 190,123.8 183.8,104.8"
        fill="#14281f"
      />
      <g stroke="#14281f" strokeWidth="3" strokeLinecap="round">
        <line x1="200" y1="93" x2="200" y2="64" />
        <line x1="216.2" y1="104.8" x2="243.7" y2="95.8" />
        <line x1="210" y1="123.8" x2="227" y2="147.2" />
        <line x1="190" y1="123.8" x2="173" y2="147.2" />
        <line x1="183.8" y1="104.8" x2="156.3" y2="95.8" />
      </g>
      <circle
        cx="200"
        cy="110"
        r="46"
        fill="none"
        stroke="#14281f"
        strokeWidth="3"
      />
    </g>
  );
}

function Trophy({ gold }: { gold: string }) {
  return (
    <g>
      <path
        d="M170 68 H230 V100 C230 122 216 134 200 134 C184 134 170 122 170 100 Z"
        fill={`url(#${gold})`}
      />
      <path
        d="M170 78 H156 C156 100 164 110 172 110"
        fill="none"
        stroke={`url(#${gold})`}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M230 78 H244 C244 100 236 110 228 110"
        fill="none"
        stroke={`url(#${gold})`}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <rect x="195" y="134" width="10" height="18" fill={`url(#${gold})`} />
      <rect
        x="177"
        y="152"
        width="46"
        height="11"
        rx="4"
        fill={`url(#${gold})`}
      />
      <path
        d="M182 76 V100"
        stroke="#fff"
        strokeOpacity="0.45"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </g>
  );
}

function Podium() {
  const text = { textAnchor: "middle" as const, fontSize: 24, fontWeight: 700 };
  return (
    <g>
      <rect x="175" y="68" width="50" height="86" rx="4" fill="#ffe27a" />
      <rect x="120" y="96" width="50" height="58" rx="4" fill="#e5e7eb" />
      <rect x="230" y="112" width="50" height="42" rx="4" fill="#e8a56a" />
      <text x="200" y="104" fill="#3a2a05" {...text}>
        1
      </text>
      <text x="145" y="130" fill="#262b33" {...text}>
        2
      </text>
      <text x="255" y="142" fill="#4a2a0c" {...text}>
        3
      </text>
    </g>
  );
}

function Phone() {
  return (
    <g>
      <rect
        x="165"
        y="40"
        width="70"
        height="132"
        rx="14"
        fill="#ffffff"
        fillOpacity="0.1"
        stroke="#ffffff"
        strokeWidth="4"
      />
      <line
        x1="190"
        y1="52"
        x2="210"
        y2="52"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <polygon points="188,92 188,124 214,108" fill="#ffffff" />
    </g>
  );
}

function Formation() {
  const dots: Array<[number, number, boolean?]> = [
    [200, 178, true],
    [128, 146],
    [172, 146],
    [228, 146],
    [272, 146],
    [150, 108],
    [200, 108],
    [250, 108],
    [138, 64],
    [200, 56],
    [262, 64],
  ];

  return (
    <g>
      {dots.map(([x, y, gk]) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r="9"
          fill={gk ? "#ffe27a" : "#ffffff"}
          stroke="#0b0f2e"
          strokeWidth="2"
        />
      ))}
    </g>
  );
}

/** غلاف SVG أصلي لكل تصنيف، بلا صور لاعبين أو شعارات. */
export function ArticleCover({ category }: { category: string }) {
  const uid = useId().replace(/:/g, "");
  const [from, to] = PALETTE[category] ?? PALETTE.default;
  const bg = `bg${uid}`;
  const gold = `gold${uid}`;

  let motif;
  switch (category) {
    case "كأس أمم أفريقيا":
      motif = <Trophy gold={gold} />;
      break;
    case "البطولة الوطنية":
      motif = <Podium />;
      break;
    case "دليل الاستخدام":
      motif = <Phone />;
      break;
    case "تحليل التشكيلات":
      motif = <Formation />;
      break;
    default:
      motif = <Ball />;
  }

  return (
    <svg
      viewBox="0 0 400 220"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
        <linearGradient id={gold} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe27a" />
          <stop offset="1" stopColor="#d99a1d" />
        </linearGradient>
      </defs>

      <rect width="400" height="220" fill={`url(#${bg})`} />

      {/* خطوط ملعب خافتة */}
      <g
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.16"
        strokeWidth="2"
      >
        <rect x="20" y="16" width="360" height="188" rx="6" />
        <line x1="200" y1="16" x2="200" y2="204" />
        <circle cx="200" cy="110" r="34" />
        <rect x="20" y="66" width="52" height="88" />
        <rect x="328" y="66" width="52" height="88" />
      </g>

      <circle cx="200" cy="110" r="92" fill="#ffffff" fillOpacity="0.07" />

      {motif}
    </svg>
  );
}

interface CardProps {
  article: Article;
  /** بطاقة كبيرة بعرض عمودين. */
  featured?: boolean;
  /** مستوى العنوان: 2 داخل صفحة المقالات، 3 داخل الرئيسية. */
  headingLevel?: 2 | 3;
}

export function ArticleCard({
  article,
  featured = false,
  headingLevel = 3,
}: CardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  // إن لم يوجد ملف الصورة نعود إلى الغلاف المرسوم بدل صورة مكسورة.
  const [imageFailed, setImageFailed] = useState(false);
  const cover = article.image;

  return (
    <article className={featured ? "acard acard--featured" : "acard"}>
      <div className="acard__cover">
        {cover && !imageFailed ? (
          <img
            src={cover.src}
            alt=""
            width={cover.width ?? 1600}
            height={cover.height ?? 900}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <ArticleCover category={article.category} />
        )}
      </div>

      <div className="acard__body">
        <div className="acard__meta">
          <span className="acard__chip">{article.category}</span>
          <time dateTime={article.date}>{fmt(article.date)}</time>
        </div>

        <Heading className="acard__title">
          <Link to={`/football/${article.slug}`} className="acard__link">
            {article.title}
          </Link>
        </Heading>

        <p className="acard__excerpt">{article.excerpt}</p>

        <div className="acard__foot">
          <span>{readingTime(article)}</span>
          <span className="acard__more" aria-hidden="true">
            اقرأ المقال ←
          </span>
        </div>
      </div>
    </article>
  );
}