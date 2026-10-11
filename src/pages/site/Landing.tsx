
import { CardsArt, PhoneArt, PitchArt } from "../../components/Art";
import { ChallengeCard } from "../../components/ChallengeCard";
import { CHALLENGES } from "../../data/challenges";
import { Link } from "../../lib/router";
import { useMeta } from "../../lib/useMeta";

export function Landing() {
  useMeta(
    "BLV Play — العب، اختَر، تحدَّ",
    "منصة تحديات كرة القدم التفاعلية: اختر أفضل اللاعبين، ابنِ تشكيلتك، وشارك بالتصوير أو دون كاميرا."
  );

  // عرض تحدي الأسطورة فقط
 
const legendChallenge = CHALLENGES.find((c) =>
  c.title.includes("الأسطورة")
);

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__text">
            <p className="eyebrow">
              BLV Play — العب، اختَر، تحدَّ.
            </p>

            <h1>تحديات كرة القدم. اختياراتك هي الحكم.</h1>

            <p className="lead">
              اختبر معرفتك بكرة القدم، اختر أفضل اللاعبين، ابنِ
              تشكيلتك المثالية، وشارك في تحديات تفاعلية ممتعة.
            </p>

            <div className="hero__actions">
              <Link
                to="/challenges"
                className="btn btn--primary btn--lg"
              >
                اكتشف التحديات
              </Link>

              <Link
                to="/create"
                className="btn btn--ghost btn--lg"
              >
                أنشئ فيديو
              </Link>
            </div>
          </div>

          <div className="hero__art" aria-hidden="false">
            <PitchArt className="hero__pitch" />
            <PhoneArt className="hero__phone" />
          </div>
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
                  سجّل اختياراتك وردود فعلك وأنشئ فيديوهات كرة
                  قدم جاهزة للمشاركة.
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
                  اختر لاعبيك المفضلين واختبر معرفتك بكرة القدم
                  دون تشغيل الكاميرا.
                </p>

                <Link to="/play" className="btn btn--primary">
                  ابدأ اللعب
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* تحدي الأسطورة فقط */}
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
              لم يتم العثور على تحدي الأسطورة.
              تحقق من اسم التحدي في ملف data/challenges.
            </p>
          )}

          <p className="center">
            <Link to="/challenges" className="link">
              اكتشف تحدي الأسطورة ←
            </Link>
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section__title">
            كيف تعمل المنصة في 3 خطوات
          </h2>

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
                تسجيل بصوتك وصورتك، وتبديل بين الكاميرا الأمامية والخلفية
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

          <p className="lead">
            ابدأ تحدياً الآن، فلا حاجة إلى حساب.
          </p>

          <Link
            to="/play"
            className="btn btn--primary btn--lg"
          >
            ابدأ اللعب
          </Link>
        </div>
      </section>
    </>
  );
}
