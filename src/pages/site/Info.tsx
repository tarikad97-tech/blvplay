import { PhoneArt, PitchArt } from "../../components/Art";
import { FAQ } from "../../data/faq";
import { Link } from "../../lib/router";
import { useMeta } from "../../lib/useMeta";

export function HowItWorks() {
  useMeta("كيف تعمل المنصة", "تعرّف على خطوات استخدام BLV Play: اختر تحديك، حدّد لاعبيك، صوّر أو العب دون كاميرا، ثم شارك النتيجة.");
  return (
    <div className="container page">
      <h1>كيف تعمل المنصة</h1>
      <ol className="steps steps--vertical">
        <li><b>1</b><h2>اختر تحديك</h2><p>من صفحة <Link to="/challenges" className="link">التحديات</Link> اختر ترتيب اللاعبين أو فريق ضد فريق أو بناء التشكيلة.</p></li>
        <li><b>2</b><h2>حدّد اللاعبين أو إجاباتك</h2><p>تظهر بطاقات اللاعبين وتختار بلمسة واحدة. التحدي يعرض لك تقدمك أثناء اللعب.</p></li>
        <li><b>3</b><h2>صوّر مشاركتك أو العب دون تصوير</h2><p>في وضع صانع المحتوى تُسجَّل الكاميرا والميكروفون مع واجهة التحدي. في وضع المشجع لا يُطلب أي إذن.</p></li>
        <li><b>4</b><h2>استعرض النتيجة وشاركها</h2><p>احفظ الفيديو من المعاينة، أو نزّل بطاقة النتيجة كصورة أو انسخ نصها.</p></li>
      </ol>
      <div className="grid grid--2 how-art">
        <figure className="figure"><PhoneArt className="figure__art" /><figcaption>وضع صانع المحتوى: واجهة التحدي داخل الفيديو</figcaption></figure>
        <figure className="figure"><PitchArt className="figure__art" /><figcaption>وضع المشجع: ملعب تكتيكي بدون كاميرا</figcaption></figure>
      </div>
    </div>
  );
}

export function About() {
  useMeta("من نحن", "BLV Play منصة تجعل تحديات كرة القدم أكثر تفاعلية وسهولة للجميع، لصناع المحتوى والمشجعين.");
  return (
    <div className="container page prose">
      <h1>من نحن</h1>
      <p>
        BLV Play منصة تفاعلية لتحديات كرة القدم. فكرتها بسيطة: أن يستطيع أي شخص أن يختار لاعبيه، ويبني تشكيلته،
        ويدخل في تحدٍّ ممتع مع أصدقائه، سواء كان صانع محتوى يريد فيديو جاهزاً للنشر أو مشجعاً يريد أن يلعب فقط.
      </p>
      <h2>وضعان لتجربة واحدة</h2>
      <p>
        <b>وضع صانع المحتوى</b> يسجّل الكاميرا والصوت مع واجهة التحدي في فيديو عمودي. <b>وضع المشجع</b> يتيح اللعب
        كاملاً دون كاميرا، وينتهي ببطاقة نتيجة قابلة للمشاركة.
      </p>
      <h2>ما نلتزم به</h2>
      <ul>
        <li>تجربة تعمل على الهاتف أولاً.</li>
        <li>خصوصية واضحة: لا نرفع فيديوهاتك ولا نشترط حساباً.</li>
        <li>عدم عرض أرقام أو إحصاءات لا نستطيع التحقق منها.</li>
      </ul>
      <p><Link to="/contact" className="link">تواصل معنا</Link> إذا كان لديك اقتراح أو ملاحظة.</p>
    </div>
  );
}

export function Faq() {
  useMeta("الأسئلة الشائعة", "إجابات عن أسئلة BLV Play: التصوير، اللعب دون كاميرا، تنزيل الفيديو، الحسابات، وأين يُخزَّن الفيديو.");
  return (
    <div className="container page prose">
      <h1>الأسئلة الشائعة</h1>
      <div className="faq">
        {FAQ.map((item) => (
          <details key={item.q} className="faq__item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
      <p>لم تجد إجابتك؟ <Link to="/contact" className="link">اتصل بنا</Link>.</p>
    </div>
  );
}

export function NotFound() {
  useMeta("الصفحة غير موجودة", "الصفحة التي تبحث عنها غير موجودة في BLV Play.");
  return (
    <div className="container page center">
      <h1>الصفحة غير موجودة</h1>
      <p className="lead">ربما تغيّر الرابط. عد إلى الرئيسية أو ابدأ تحدياً.</p>
      <p><Link to="/" className="btn btn--primary">الرئيسية</Link> <Link to="/challenges" className="btn btn--ghost">التحديات</Link></p>
    </div>
  );
}
