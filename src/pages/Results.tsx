import { useState } from "react";
import { Face } from "../components/Face";
import { useResult } from "../context/ResultContext";
import { Link } from "../lib/router";
import { useMeta } from "../lib/useMeta";
import { renderResultImage, resultAsText } from "../utils/resultImage";

export function Results() {
  useMeta("نتيجتك", "نتيجة تحدي كرة القدم الذي لعبته على BLV Play: نزّل البطاقة كصورة أو شاركها.");
  const { result } = useResult();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  if (!result) {
    return (
      <div className="container page center">
        <h1>لا توجد نتيجة بعد</h1>
        <p className="lead">أكمل تحدياً في وضع المشجع لتظهر نتيجتك هنا.</p>
        <p><Link to="/play" className="btn btn--primary">ابدأ اللعب</Link></p>
      </div>
    );
  }

  const filename = `blv-play-${result.challengeId}.png`;

  async function download() {
    if (!result) return;
    setBusy(true);
    setStatus("");
    try {
      const blob = await renderResultImage(result);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setStatus("تم تنزيل الصورة.");
    } catch {
      setStatus("تعذّر إنشاء الصورة على هذا المتصفح.");
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    if (!result) return;
    setBusy(true);
    setStatus("");
    try {
      const blob = await renderResultImage(result);
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `BLV Play — ${result.title}`, text: result.headline });
      } else if (navigator.share) {
        await navigator.share({ title: `BLV Play — ${result.title}`, text: resultAsText(result) });
      } else {
        setStatus("المشاركة غير مدعومة في هذا المتصفح. استعمل «تنزيل الصورة» أو «نسخ النتيجة».");
      }
    } catch (e) {
      // The user closing the share sheet is not an error.
      if (!(e instanceof DOMException && e.name === "AbortError")) setStatus("تعذّرت المشاركة.");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(resultAsText(result));
      setStatus("تم نسخ النتيجة.");
    } catch {
      setStatus("تعذّر النسخ. انسخ النص يدوياً من البطاقة.");
    }
  }

  return (
    <div className="container page">
      <article className="result" aria-label="بطاقة النتيجة">
        <p className="eyebrow">BLV PLAY · {result.title}</p>
        <h1>{result.headline}</h1>
        <p className="lead">{result.detail}</p>
        <ul className="result__grid">
          {result.items.map((item, i) => (
            <li key={i}>
              <Face name={item.name} image={item.image} />
              <strong>{item.name}</strong>
              <span className="muted">{item.sub ? `${item.label} · ${item.sub}` : item.label}</span>
            </li>
          ))}
        </ul>
      </article>

      <div className="game__actions">
        <button type="button" className="btn btn--primary" onClick={() => void download()} disabled={busy}>تنزيل الصورة</button>
        <button type="button" className="btn btn--ghost" onClick={() => void share()} disabled={busy}>مشاركة</button>
        <button type="button" className="btn btn--ghost" onClick={() => void copy()}>نسخ النتيجة</button>
      </div>
      <p className="center muted" role="status">{status}</p>
      <div className="game__actions">
        <Link to={`/play/${result.challengeId}`} className="btn btn--primary">العب مجدداً</Link>
        <Link to="/play" className="btn btn--ghost">جرّب تحدياً آخر</Link>
      </div>
    </div>
  );
}
