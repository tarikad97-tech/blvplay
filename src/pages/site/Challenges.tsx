
import { useMemo, useState } from "react";
import { ChallengeCard } from "../../components/ChallengeCard";
import { CHALLENGES, type PlayMode } from "../../data/challenges";
import { useMeta } from "../../lib/useMeta";

export function Challenges() {
  useMeta(
    "التحديات",
    "اكتشف تحدي الأسطورة في كرة القدم. العب دون كاميرا أو صوّر تجربتك."
  );

  const [query, setQuery] = useState("");
  const [type, setType] = useState("الكل");
  const [mode, setMode] = useState<"all" | PlayMode>("all");

  const list = useMemo(() => {
    const q = query.trim();

    return CHALLENGES.filter(
      (c) =>
        c.title.includes("الأسطورة") &&
        (type === "الكل" || c.type === type) &&
        (mode === "all" || c.modes.includes(mode)) &&
        (!q ||
          (c.title + c.description + c.topic).includes(q))
    );
  }, [query, type, mode]);

  return (
    <div className="container page">
      <h1>التحديات</h1>

      <p className="lead">
        تحدٍّ واحد، متعة لا محدودة! اختبر معلوماتك الكروية في تحدي الأسطورة.
      </p>

      <div className="filters">
        <label className="field field--grow">
          <span className="sr-only">ابحث عن تحدي الأسطورة</span>

          <input
            type="search"
            placeholder="ابحث عن تحدي الأسطورة…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <div
          className="chips"
          role="group"
          aria-label="نوع التحدي"
        >
          {[
            "الكل",
            ...Array.from(
              new Set(
                CHALLENGES.filter((c) =>
                  c.title.includes("الأسطورة")
                ).map((c) => c.type)
              )
            ),
          ].map((t) => (
            <button
              key={t}
              type="button"
              className={t === type ? "chip is-on" : "chip"}
              aria-pressed={t === type}
              onClick={() => setType(t)}
            >
              {t}
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
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              className={v === mode ? "chip is-on" : "chip"}
              aria-pressed={v === mode}
              onClick={() => setMode(v)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {list.length > 0 ? (
        <div className="grid grid--3">
          {list.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </div>
      ) : (
        <p className="empty">
          لا يوجد تحدي أسطورة مطابق لبحثك أو للتصفية المختارة.
        </p>
      )}
    </div>
  );
}
