import { ArticleCard } from "../../components/ArticleCard";
import { ARTICLES, getArticle, type ArticleImage } from "../../data/articles";
import { Link } from "../../lib/router";
import { useMeta } from "../../lib/useMeta";
import { NotFound } from "./Info";
import "../../styles/article.css";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("ar-MA", { year: "numeric", month: "long", day: "numeric" });

export function Football() {
  useMeta(
    "مركز المقالات",
    "أخبار وتحليلات كرة القدم المغربية: المنتخب والبطولة الاحترافية وكأس أمم أفريقيا، إضافة إلى أدلة استخدام تحديات BLV Play."
  );

  // الأحدث أولاً. البطاقة الأولى كبيرة.
  const sorted = [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="container page">
      <h1>مركز المقالات</h1>
      <p className="lead">أخبار الكرة المغربية وتحليلاتها، وأدلة عملية للاستفادة من التحديات.</p>
      <div className="agrid">
        {sorted.map((a, i) => (
          <ArticleCard key={a.slug} article={a} featured={i === 0} headingLevel={2} />
        ))}
      </div>
    </div>
  );
}

/** صورة داخل المقال. إن لم يوجد الملف تختفي بدل أن تظهر مكسورة. */
function Figure({ image, cover = false }: { image: ArticleImage; cover?: boolean }) {
  return (
    <figure className={cover ? "afig afig--cover" : "afig"}>
      <img
        className="afig__img"
        src={image.src}
        alt={image.alt}
        width={image.width ?? 1600}
        height={image.height ?? 900}
        loading={cover ? "eager" : "lazy"}
        decoding="async"
        onError={(event) => event.currentTarget.closest("figure")?.setAttribute("hidden", "")}
      />
      {image.caption && <figcaption className="afig__cap">{image.caption}</figcaption>}
    </figure>
  );
}

export function ArticlePage({ slug }: { slug: string }) {
  const article = getArticle(slug);
  useMeta(article?.title ?? "مقال غير موجود", article?.excerpt ?? "المقال غير موجود.");
  if (!article) return <NotFound />;
  const related = article.related.map(getArticle).filter((a) => a !== undefined);
  return (
    <div className="container page prose">
      <p><Link to="/football/" className="link">← مركز المقالات</Link></p>
      <h1>{article.title}</h1>
      <p className="muted"><span className="chip">{article.category}</span> <time dateTime={article.date}>{fmt(article.date)}</time></p>
      {article.image && <Figure image={article.image} cover />}
      {article.sections.map((s) => (
        <section key={s.heading}>
          <h2>{s.heading}</h2>
          {s.image && <Figure image={s.image} />}
          {s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </section>
      ))}
      <aside className="related">
        <h2>مقالات ذات صلة</h2>
        <ul>{related.map((r) => <li key={r.slug}><Link to={`/football/${r.slug}/`} className="link">{r.title}</Link></li>)}</ul>
        <p><Link to="/play" className="btn btn--primary">جرّب تحدياً الآن</Link></p>
      </aside>
    </div>
  );
}