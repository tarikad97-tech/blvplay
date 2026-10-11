import { ARTICLES, getArticle } from "../../data/articles";
import { Link } from "../../lib/router";
import { useMeta } from "../../lib/useMeta";
import { NotFound } from "./Info";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("ar-MA", { year: "numeric", month: "long", day: "numeric" });

export function Football() {
  useMeta("مركز المقالات", "أدلة وتحليلات كروية من BLV Play: كيف تصوّر تحدياً، كيف تلعب دون كاميرا، وكيف تبني تشكيلة 4-3-3.");
  return (
    <div className="container page">
      <h1>مركز المقالات</h1>
      <p className="lead">أدلة عملية وتحليلات قصيرة تساعدك على الاستفادة من التحديات.</p>
      <div className="grid grid--3">
        {ARTICLES.map((a) => (
          <article key={a.slug} className="card">
            <div className="card__body">
              <div className="chips"><span className="chip">{a.category}</span></div>
              <h2 className="card__title"><Link to={`/football/${a.slug}`}>{a.title}</Link></h2>
              <p className="card__text">{a.excerpt}</p>
              <time dateTime={a.date} className="muted">{fmt(a.date)}</time>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function ArticlePage({ slug }: { slug: string }) {
  const article = getArticle(slug);
  useMeta(article?.title ?? "مقال غير موجود", article?.excerpt ?? "المقال غير موجود.");
  if (!article) return <NotFound />;
  const related = article.related.map(getArticle).filter((a) => a !== undefined);
  return (
    <div className="container page prose">
      <p><Link to="/football" className="link">← مركز المقالات</Link></p>
      <h1>{article.title}</h1>
      <p className="muted"><span className="chip">{article.category}</span> <time dateTime={article.date}>{fmt(article.date)}</time></p>
      {article.sections.map((s) => (
        <section key={s.heading}>
          <h2>{s.heading}</h2>
          {s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </section>
      ))}
      <aside className="related">
        <h2>مقالات ذات صلة</h2>
        <ul>{related.map((r) => <li key={r.slug}><Link to={`/football/${r.slug}`} className="link">{r.title}</Link></li>)}</ul>
        <p><Link to="/play" className="btn btn--primary">جرّب تحدياً الآن</Link></p>
      </aside>
    </div>
  );
}
