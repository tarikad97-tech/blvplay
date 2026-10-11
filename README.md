# BLV Play — العب، اختَر، تحدَّ

منصة تحديات كرة قدم تفاعلية بوضعين: **صانع المحتوى** (تصوير بالكاميرا والميكروفون، فيديو 9:16) و**المشجع** (بدون كاميرا، ينتهي ببطاقة نتيجة).

## التشغيل
```bash
npm install
npm run dev
npm run build      # يولّد robots/sitemap ثم tsc + vite build
```
الكاميرا تحتاج HTTPS أو localhost.

## الصفحات
`/` `/challenges` `/create` `/create/:id` `/play` `/play/:id` `/results` `/how-it-works` `/about` `/contact`
`/football` `/football/:slug` `/faq` `/privacy-policy` `/terms` `/cookie-policy`

المسارات حقيقية (History API) عبر موجّه صغير في `src/lib/router.tsx` بلا اعتماد خارجي.
يجب أن يقدّم الاستضافة `index.html` لأي مسار غير موجود: `public/_redirects` (Netlify/Cloudflare) و`vercel.json` (Vercel) جاهزان.

## التحديات (`src/data/challenges.ts`)
| التحدي | التصوير | بدون كاميرا |
|---|---|---|
| طريق الأسطورة | `public/legend/index.html` (كما هو) | نفس الملف مع `?mode=fan` |
| ترتيب أفضل 5 | `pages/Studio.tsx` | `pages/fan/FanRank5.tsx` |
| بطل 2025 ضد بطل 2026 | `pages/BattleStudio.tsx` | `pages/fan/FanBattle.tsx` |
| أفضل تشكيلة 4-3-3 | — | `pages/fan/FanBestXI.tsx` |

- فلتر «طريق الأسطورة» يُعرض داخل iframe دون تغيير منطقه. أضفت له فقط وضع `?mode=fan` (خلفية ملعب، بلا كاميرا ولا تسجيل، وبطاقة المسيرة تُحفظ PNG).
  شعارات الأندية تُوضع في `public/legend/logos/<id>.png`، وبدونها يرسم الفلتر شعاراً بديلاً.
- صور اللاعبين في `public/players/` (انظر README هناك). الصورة الناقصة تظهر بالأحرف الأولى.
- بيانات Team Battle من تصميمك v3 ولم يُتحقق منها (انظر تعليق `src/data/teams.ts`).

## الاتصال والـ SEO
- نموذج التواصل لا يرسل شيئاً حتى تضبط `VITE_CONTACT_ENDPOINT` (نقطة استقبال JSON مثل Formspree) و`VITE_CONTACT_EMAIL` (بريد حقيقي).
- `SITE_URL=https://دومينك npm run build` يولّد `sitemap.xml` و`robots.txt` بروابط مطلقة.
- الصفحات تضبط `<title>` و`description` لكل مسار (`src/lib/useMeta.ts`). لا تُضف الإعلانات إلا بعد تحديث سياسة الخصوصية وسياسة Cookies.
