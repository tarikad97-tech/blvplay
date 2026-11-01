import { CardsArt, PhoneArt, PitchArt } from "../../components/Art";
import { ArticleCard } from "../../components/ArticleCard";
import { ChallengeCard } from "../../components/ChallengeCard";
import { HeroSlider, type HeroSlide } from "../../components/HeroSlider";
import { ARTICLES } from "../../data/articles";
import { CHALLENGES } from "../../data/challenges";
import { Link } from "../../lib/router";
import { useMeta } from "../../lib/useMeta";
import "../../styles/home.css";

/**
 * الشرائح الثلاث. كل شريحة ترسم SVG أصلياً من مكوّنات Art عندك.
 * الصور تملأ الشريحة كلها: 1.webp للحاسوب (16:9) و1-m.webp للهاتف (2:3)
 * داخل public/slides/. إذا لم يوجد الملف يعود السلايدر تلقائياً إلى الرسم،
 * فلا تظهر صورة مكسورة. imageAlt فارغ لأن النص بجانب الصورة يشرح المعنى؛
 * اكتب وصفاً فقط إن كانت الصورة تحمل معلومة غير مكتوبة.
 */
const SLIDES: readonly HeroSlide[] = [
  {
    id: "news",
    eyebrow: "أخبار وتحليلات",
    title: "كرة القدم المغربية في مكان واحد",
    text: "مقالات واضحة عن المنتخب والبطولة الاحترافية وكأس أمم أفريقيا، نحدّثها كلما تغيّرت الوقائع.",
    cta: { to: "/football", label: "اقرأ المقالات" },
    cta2: { to: "/challenges", label: "جرّب التحديات" },
    art: <PitchArt className="hslide__svg" />,
    accent: "#34d399",
    glow: "rgba(52, 211, 153, 0.18)",
    image: "/slides/1.webp",
    imageMobile: "/slides/1-m.webp",
    imageAlt: "",
  },
  {
    id: "legend",
    eyebrow: "تحدٍّ تفاعلي",
    title: "ابدأ لاعباً بعمر 17 سنة وابنِ مسيرتك",
    text: "في تحدي «طريق الأسطورة» تختار ناديك وقراراتك وعروض الانتقال حتى الاعتزال، وتكتشف هل تصبح أسطورة.",
    cta: { to: "/challenges", label: "ابدأ التحدي" },
    cta2: { to: "/play", label: "العب الآن" },
    art: <PhoneArt className="hslide__svg" />,
    accent: "#f3cb52",
    glow: "rgba(232, 185, 35, 0.2)",
    image: "/slides/2.webp",
    imageMobile: "/slides/2-m.webp",
    imageAlt: "",
  },
  {
    id: "modes",
    eyebrow: "بدون حساب",
    title: "العب دون كاميرا أو صوّر نفسك",
    text: "وضع المشجع لا يطلب كاميرا ولا ميكروفوناً ولا حساباً. ووضع صانع المحتوى يصنع فيديو عمودياً يبقى على جهازك.",
    cta: { to: "/play", label: "ابدأ اللعب" },
    cta2: { to: "/create", label: "أنشئ فيديو" },
    art: <CardsArt className="hslide__svg" />,
    accent: "#5aa9ff",
    glow: "rgba(90, 169, 255, 0.2)",
    image: "/slides/3.webp",
    imageMobile: "/slides/3-m.webp",
    imageAlt: "",
  },
];

export function Landing() {
  useMeta(
    "BLV Play — أخبار كرة القدم المغربية وتحديات تفاعلية",
    "تابع أبرز أحداث الكرة المغربية من المنتخب والبطولة الاحترافية وكأس أمم أفريقيا، وشارك في تحديات كروية تفاعلية بالتصوير أو دون كاميرا."
  );

  // تحدي الأسطورة فقط
  const legendChallenge = CHALLENGES.find((c) =>
    c.title.includes("الأسطورة")
  );

  // أحدث 5 مقالات: بطاقة كبيرة + أربع بطاقات تملأ الشبكة تماماً.
  const latest = [...ARTICLES]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <>
      {/* عنوان الصفحة الوحيد (h1) لمحركات البحث وقارئات الشاشة */}
      <h1 className="sr-only">
        BLV Play: أخبار كرة القدم المغربية وتحليلاتها وتحديات تفاعلية
      </h1>

      <HeroSlider slides={SLIDES} label="تعريف بموقع BLV Play" />

      {/* آخر المقالات */}
      <section className="hsec">
        <div className="container">
          <div className="hsec__head">
            <div>
              <h2 className="hsec__title">آخر المقالات</h2>
              <p className="hsec__sub">
                أخبار الكرة المغربية وتحليلاتها، وأدلة استخدام المنصة.
              </p>
            </div>

            <Link to="/football" className="link">
              كل المقالات ←
            </Link>
          </div>

          <div className="agrid">
            {latest.map((article, i) => (
              <ArticleCard
                key={article.slug}
                article={article}
                featured={i === 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* تعريف بالموقع */}
      <section className="section section--alt">
        <div className="container prose">
          <h2 className="section__title">ما هي BLV Play؟</h2>

          <p>
            BLV Play موقع عربي لمشجعي كرة القدم. يجمع بين شيئين: مقالات
            تشرح ما يجري في الكرة المغربية والأفريقية، وتحديات تفاعلية
            تحوّل المتابعة إلى لعب. بعد أن تقرأ عن مشوار المنتخب في
            المونديال أو عن لقب البطولة الاحترافية، يمكنك أن تبني
            تشكيلتك الخاصة وتدافع عن اختياراتك.
          </p>

          <p>
            نكتب مقالاتنا بالاعتماد على تقارير منشورة ومصادر رسمية،
            ونذكر في كل مقال ما هو مؤكد وما لا يزال مفتوحاً، ونحدّث
            النص عندما تتغير الوقائع. وإذا لاحظت خطأً، فراسلنا عبر
            صفحة <Link to="/contact" className="link">اتصل بنا</Link>.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section__title">اختر طريقة المشاركة</h2>

          <div className="grid grid--2">
            <article className="card mode-card">
              <div className="card__media">
                <PhoneArt className="card__art card__art--phone" />
              </div>

              <div className="card__body">
                <p className="eyebrow">صانع المحتوى</p>
                <h3 className="card__title">صوّر تحديك</h3>

                <p className="card__text">
                  سجّل اختياراتك وردود فعلك وأنشئ فيديوهات كرة قدم
                  جاهزة للمشاركة.
                </p>

                <Link to="/create" className="btn btn--primary">
                  ابدأ التصوير
                </Link>
              </div>
            </article>

            <article className="card mode-card">
              <div className="card__media">
                <PitchArt className="card__art card__art--pitch" />
              </div>

              <div className="card__body">
                <p className="eyebrow">المشجع</p>
                <h3 className="card__title">شارك بدون تصوير</h3>

                <p className="card__text">
                  اختر لاعبيك المفضلين واختبر معرفتك بكرة القدم دون
                  تشغيل الكاميرا.
                </p>

                <Link to="/play" className="btn btn--primary">
                  ابدأ اللعب
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* تحدي الأسطورة */}
      <section className="section section--alt">
        <div className="container">
          <h2 className="section__title">تحدي الأسطورة</h2>

          {legendChallenge ? (
            <div className="grid grid--3">
              <ChallengeCard
                key={legendChallenge.id}
                challenge={legendChallenge}
                featured
              />
            </div>
          ) : (
            <p className="center">
              لم يتم العثور على تحدي الأسطورة. تحقق من اسم التحدي في
              ملف data/challenges.
            </p>
          )}

          <p className="center">
            <Link to="/challenges" className="link">
              كل التحديات ←
            </Link>
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section__title">كيف تعمل المنصة في 3 خطوات</h2>

          <ol className="steps">
            <li>
              <b>1</b>
              <h3>اختر تحديك</h3>
              <p>ترتيب لاعبين، فريق ضد فريق، أو بناء تشكيلة.</p>
            </li>

            <li>
              <b>2</b>
              <h3>اختر لاعبيك</h3>
              <p>صوّر مشاركتك بصوتك، أو العب دون كاميرا.</p>
            </li>

            <li>
              <b>3</b>
              <h3>شارك النتيجة</h3>
              <p>احفظ الفيديو أو نزّل بطاقة النتيجة كصورة.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container grid grid--2">
          <div>
            <h2 className="section__title">لصناع المحتوى</h2>

            <ul className="ticks">
              <li>فيديو عمودي 9:16 بدقة 1080×1920</li>
              <li>الأسئلة والاختيارات تظهر داخل الفيديو نفسه</li>
              <li>
                تسجيل بصوتك وصورتك، وتبديل بين الكاميرا الأمامية
                والخلفية
              </li>
              <li>الفيديو يبقى على جهازك ولا يُرفع إلى أي خادم</li>
            </ul>
          </div>

          <div>
            <h2 className="section__title">للمشجعين</h2>

            <ul className="ticks">
              <li>لا كاميرا ولا ميكروفون ولا حساب</li>
              <li>ملعب تكتيكي وبطاقات لاعبين سهلة الاختيار بالإبهام</li>
              <li>إمكانية التراجع عن الاختيار واستبدال اللاعب</li>
              <li>بطاقة نتيجة تنزّلها كصورة أو تنسخ نصها</li>
            </ul>

            <CardsArt className="inline-art" />
          </div>
        </div>
      </section>

      <section className="section cta-band">
        <div className="container center">
          <h2>جاهز لتتحدى أصدقاءك؟</h2>

          <p className="lead">ابدأ تحدياً الآن، فلا حاجة إلى حساب.</p>

          <Link to="/play" className="btn btn--primary btn--lg">
            ابدأ اللعب
          </Link>
        </div>
      </section>
    </>
  );
}