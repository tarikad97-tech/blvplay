import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Link } from "../lib/router";

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  cta: { to: string; label: string };
  cta2?: { to: string; label: string };
  /** رسم SVG يظهر عند غياب الصورة أو فشل تحميلها. */
  art: ReactNode;
  /** صورة سطح المكتب (16:9) داخل public، تملأ الشريحة كلها. */
  image?: string;
  /** صورة الهاتف (2:3 عمودية) تُستعمل تحت عرض 860px. */
  imageMobile?: string;
  /** وصف الصورة. اتركه فارغاً إذا كانت زخرفية والنص يشرح المعنى. */
  imageAlt?: string;
  /** لون التمييز واللمعان الخلفي للشريحة. */
  accent: string;
  glow: string;
}

interface Props {
  slides: readonly HeroSlide[];
  /** مدة بقاء كل شريحة بالمللي ثانية. */
  interval?: number;
  label: string;
}

function usePrefersReducedMotion(): boolean {
  const query = "(prefers-reduced-motion: reduce)";
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setReduced(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export function HeroSlider({ slides, interval = 7000, label }: Props) {
  const count = slides.length;
  const reduced = usePrefersReducedMotion();

  const [index, setIndex] = useState(0);
  // من فعّل «تقليل الحركة» في هاتفه (مثل «إزالة الرسوم المتحركة» في أندرويد)
  // لا يتحرك السلايدر عنده تلقائياً، ويستطيع تشغيله بزر التشغيل.
  const [userPaused, setUserPaused] = useState(reduced);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [startX, setStartX] = useState<number | null>(null);
  // الشرائح التي فشلت صورتها (ملف غير موجود مثلاً) فتعود إلى الرسم.
  const [broken, setBroken] = useState<Record<string, boolean>>({});

  const paused = userPaused || hovered || focused;

  const go = useCallback(
    (target: number) => setIndex(((target % count) + count) % count),
    [count]
  );
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  // عند التقليل من الحركة لا يوجد شريط تقدّم يقود التبديل، فنستعمل مؤقتاً.
  useEffect(() => {
    if (!reduced || paused || count < 2) return;
    const id = window.setTimeout(next, interval);
    return () => window.clearTimeout(id);
  }, [reduced, paused, count, interval, next]);

  // الإيقاف عند التركيز للوحة المفاتيح فقط. على الهاتف يبقى التركيز على الزر
  // بعد اللمس، ولو أوقفنا عنده لتجمّد السلايدر بعد أول لمسة.
  function onFocus(event: FocusEvent<HTMLElement>) {
    let keyboard = false;
    try {
      keyboard = (event.target as HTMLElement).matches(":focus-visible");
    } catch {
      keyboard = false;
    }
    setFocused(keyboard);
  }

  function onBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setFocused(false);
    }
  }

  // الإيقاف بالمرور للفأرة فقط. اللمس يُحاكي «المرور» ولا يلغيه أبداً،
  // فكان يجمّد السلايدر بعد أول لمسة.
  function onPointerEnter(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse") setHovered(true);
  }

  function onPointerLeave(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse") setHovered(false);
  }

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    setStartX(event.clientX);
  }

  function onPointerUp(event: PointerEvent<HTMLElement>) {
    if (startX === null) return;
    const dx = event.clientX - startX;
    setStartX(null);
    if (Math.abs(dx) < 50) return;
    // الموقع من اليمين إلى اليسار: السحب لليسار يعني الشريحة التالية.
    if (dx < 0) next();
    else prev();
  }

  return (
    <section
      className={paused ? "hslider is-paused" : "hslider"}
      aria-roledescription="carousel"
      aria-label={label}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <div
        className="hslider__track"
        aria-live={paused ? "polite" : "off"}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setStartX(null)}
      >
        {slides.map((slide, i) => {
          const active = i === index;
          const showImage = Boolean(slide.image) && !broken[slide.id];

          const className = [
            "hslide",
            active ? "is-active" : "",
            showImage ? "hslide--image" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={slide.id}
              className={className}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} من ${count}`}
              aria-hidden={!active}
              style={
                {
                  "--slide-accent": slide.accent,
                  "--slide-glow": slide.glow,
                } as CSSProperties
              }
            >
              {showImage && (
                <>
                  <div className="hslide__bg">
                    <picture>
                      {slide.imageMobile && (
                        <source
                          media="(max-width: 859px)"
                          srcSet={slide.imageMobile}
                        />
                      )}
                      <img
                        src={slide.image}
                        alt={slide.imageAlt ?? ""}
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding="async"
                        onError={() =>
                          setBroken((prevState) => ({
                            ...prevState,
                            [slide.id]: true,
                          }))
                        }
                      />
                    </picture>
                  </div>
                  <div className="hslide__scrim" aria-hidden="true" />
                </>
              )}

              <div className="container hslide__in">
                <div className="hslide__text">
                  <p className="hslide__eyebrow">{slide.eyebrow}</p>
                  <h2 className="hslide__title">{slide.title}</h2>
                  <p className="hslide__lead">{slide.text}</p>

                  <div className="hslide__actions">
                    <Link
                      to={slide.cta.to}
                      className="btn btn--primary btn--lg"
                    >
                      {slide.cta.label}
                    </Link>

                    {slide.cta2 && (
                      <Link
                        to={slide.cta2.to}
                        className="btn btn--ghost btn--lg"
                      >
                        {slide.cta2.label}
                      </Link>
                    )}
                  </div>
                </div>

                {!showImage && <div className="hslide__art">{slide.art}</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="hslider__ctrl">
        <div className="container hslider__ctrl-in">
          <div className="hslider__dots" role="group" aria-label="اختيار الشريحة">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                className={i === index ? "hslider__dot is-on" : "hslider__dot"}
                aria-label={`الانتقال إلى الشريحة ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
              />
            ))}
          </div>

          <div className="hslider__btns">
            <button
              type="button"
              className="hslider__btn"
              aria-label="الشريحة السابقة"
              onClick={prev}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                  d="M9 5l7 7-7 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              type="button"
              className="hslider__btn"
              aria-label={
                userPaused
                  ? "تشغيل التبديل التلقائي"
                  : "إيقاف التبديل التلقائي"
              }
              onClick={() => setUserPaused((value) => !value)}
            >
              {userPaused ? (
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M8 5v14l11-7z" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" />
                </svg>
              )}
            </button>

            <button
              type="button"
              className="hslider__btn"
              aria-label="الشريحة التالية"
              onClick={next}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                  d="M15 5l-7 7 7 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* شريط التقدم يقود التبديل: ينتهي الأنيميشن فتنتقل الشريحة. */}
      {!reduced && (
        <span
          key={index}
          className="hslider__bar"
          style={{ animationDuration: `${interval}ms` }}
          onAnimationEnd={next}
          aria-hidden="true"
        />
      )}
    </section>
  );
}