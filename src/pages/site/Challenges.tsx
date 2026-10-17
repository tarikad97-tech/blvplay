
import { useMemo, useState } from "react";
import { ChallengeCard } from "../../components/ChallengeCard";
import {
  CHALLENGES,
  type PlayMode,
} from "../../data/challenges";
import { useMeta } from "../../lib/useMeta";

/**
 * توحيد النص قبل البحث:
 * - إزالة المسافات الزائدة.
 * - توحيد بعض أشكال الحروف العربية الشائعة.
 */
function normalizeSearch(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .toLowerCase();
}

export function Challenges() {
  useMeta(
    "تحديات كرة القدم التفاعلية | BLV Play",
    "اكتشف تحديات كرة القدم التفاعلية، واختر وضع اللعب دون كاميرا أو وضع التصوير عندما يكون متاحًا."
  );

  const [query, setQuery] = useState("");
  const [type, setType] = useState("الكل");
  const [mode, setMode] = useState<"all" | PlayMode>("all");

  // استخراج أنواع التحديات الموجودة فعليًا دون تكرار.
  const types = useMemo(
    () => [
      "الكل",
      ...new Set(CHALLENGES.map((challenge) => challenge.type)),
    ],
    []
  );

  // البحث والتصفية اعتمادًا على بيانات التحديات الحقيقية.
  const list = useMemo(() => {
    const q = normalizeSearch(query);

    return CHALLENGES.filter((challenge) => {
      const searchableText = normalizeSearch(
        [
          challenge.title,
          challenge.description,
          challenge.topic,
          challenge.type,
        ].join(" ")
      );

      const matchesQuery =
        !q || searchableText.includes(q);

      const matchesType =
        type === "الكل" || challenge.type === type;

      const matchesMode =
        mode === "all" || challenge.modes.includes(mode);

      return matchesQuery && matchesType && matchesMode;
    });
  }, [query, type, mode]);

  return (
    <div className="container page">
      <h1>تحديات كرة القدم</h1>

      <p className="lead">
        اختبر معرفتك بكرة القدم، واتخذ قراراتك داخل تحديات تفاعلية.
        اختر طريقة المشاركة المناسبة لكل تحدٍّ.
      </p>

      <div className="filters">
        <label className="field field--grow">
          <span className="sr-only">
            البحث في تحديات كرة القدم
          </span>

          <input
            type="search"
            placeholder="ابحث عن تحدٍّ..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="chips" role="group" aria-label="نوع التحدي">
          {types.map((item) => (
            <button
              key={item}
              type="button"
              className={item === type ? "chip is-on" : "chip"}
              aria-pressed={item === type}
              onClick={() => setType(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div
          className="chips"
          role="group"
          aria-label="طريقة المشاركة"
        >
          {(
            [
              ["all", "كل الأوضاع"],
              ["fan", "بدون تصوير"],
              ["creator", "للتصوير"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={value === mode ? "chip is-on" : "chip"}
              aria-pressed={value === mode}
              onClick={() => setMode(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {list.length > 0 ? (
        <>
          <p className="muted" aria-live="polite">
            عدد التحديات: {list.length}
          </p>

          <div className="grid grid--3">
            {list.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="empty" role="status">
          <p>ما لقينا حتى تحدٍّ مطابق لبحثك.</p>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setQuery("");
              setType("الكل");
              setMode("all");
            }}
          >
            عرض جميع التحديات
          </button>
        </div>
      )}
    </div>
  );
}
