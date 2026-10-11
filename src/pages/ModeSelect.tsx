import { Link } from "../lib/router";
import { useMeta } from "../lib/useMeta";
import { CHALLENGES, type PlayMode } from "../data/challenges";

export function ModeSelect({ mode }: { mode: PlayMode }) {
  const creator = mode === "creator";
  useMeta(
    creator ? "صانع المحتوى — صوّر تحديك" : "وضع المشجع — العب بدون تصوير",
    creator
      ? "اختر تحدياً وصوّر مشاركتك بالكاميرا والميكروفون لإنتاج فيديو عمودي جاهز لـ Reels وTikTok وShorts."
      : "العب تحديات كرة القدم دون كاميرا: اختر لاعبيك، ابنِ تشكيلتك، وانتهِ ببطاقة نتيجة تشاركها."
  );
  const list = CHALLENGES.filter((c) => c.modes.includes(mode));
  const base = creator ? "/create" : "/play";
  return (
    <div className="container page">
      <h1>{creator ? "صوّر تحديك" : "شارك بدون تصوير"}</h1>
      <p className="lead">
        {creator
          ? "اختر تحدياً، اسمح بالكاميرا والميكروفون، ثم سجّل. الفيديو يبقى على جهازك."
          : "لا كاميرا ولا ميكروفون ولا حساب. اختر تحدياً وابدأ."}
      </p>
      <div className="grid grid--3">
        {list.map((c) => (
          <article key={c.id} className="card">
            <div className="card__body">
              <div className="chips"><span className="chip">{c.type}</span><span className="chip chip--muted">{c.duration}</span></div>
              <h2 className="card__title">{c.title}</h2>
              <p className="card__text">{c.description}</p>
              <Link to={`${base}/${c.id}`} className="btn btn--primary">{creator ? "ابدأ التصوير" : "ابدأ اللعب"}</Link>
            </div>
          </article>
        ))}
      </div>
      <p className="muted center">
        {creator ? <>تفضّل اللعب دون تصوير؟ <Link to="/play" className="link">وضع المشجع</Link></> : <>تريد صنع فيديو؟ <Link to="/create" className="link">وضع صانع المحتوى</Link></>}
      </p>
    </div>
  );
}
