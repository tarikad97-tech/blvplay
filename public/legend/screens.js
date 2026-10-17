"use strict";
/* ==========================================================
   screens.js — شاشات اللعبة والإطار الرئيسي
   يعتمد على: render.js (أدوات الرسم) + engine.js + data.js
   ومتغيرات يعرّفها main.js: g · W · H · RES · S · FAN · vid · PICK
   ========================================================== */

/* ---------- 1) سلّم المسيرة (الجانب الأيسر) ---------- */

// معلومات فترة اللاعب في نادٍ عند عمر معيّن: النادي، السنة، رقم الموسم في النادي
function spell(c, age) {
  const i = c.log.findIndex(l => l.age == age);
  if (i < 0) return null;
  let k = 1;
  while (i - k >= 0 && c.log[i - k].cid == c.log[i].cid) k++;   // عدّ المواسم المتتالية في نفس النادي
  return { k: CL[c.log[i].cid], yr: c.log[i].yr, n: k };
}

// شارة العمر على يسار الشريط. lb: النص، rc: هل يوجد نادٍ، f: أول عنصر (عمر 17)
function badge(cy, lb, rc, f) {
  const x = 68, w = 110, h = 66;
  if (lb == "R" || lb == "M") { rect(x, cy - h / 2, w, h, lb == "R" ? YE : PU); T(lb == "R" ? "ع" : "ت", x + w / 2, cy, 44, INK); }   // اعتزال / تدريب
  else if (f)  { rect(x, cy - h / 2, w, h, YE); T("أ", x + w / 2, cy, 48, INK); }                                                    // البداية
  else if (rc) { rect(x, cy - h / 2, w, h, PU); T(lb, x + w / 2, cy, 46, INK); }                                                     // عمر له نادٍ
  else {                                                                                                                              // عمر لم يصل إليه بعد
    g.beginPath(); g.roundRect(x, cy - h / 2, w, h, 12); g.fillStyle = GY; g.fill();
    g.lineWidth = 4; g.strokeStyle = "#ffffffd9"; g.stroke();
    T(lb, x + w / 2, cy, 46, "#ffffffe6");
  }
}

// رسم السلّم كاملاً؛ t = الزمن لتحريك دخول الأندية الجديدة بالتتابع
function ladder(s, t) {
  const c = s.c;
  const ch = s.stage == "chapter" ? s.ch : null;
  [...LAD.map(String), "R", "M"].forEach((lb, i) => {
    const cy = 190 + i * 75;
    const age = i < 10 ? LAD[i] : 0;
    const inf = c && age ? spell(c, age) : null;
    const del = ch && age >= ch.a ? .35 + (age - ch.a) * .16 : 0;                                  // تأخير الظهور لكل عمر
    const p = inf && ch && age >= ch.a ? c01(eob(c01((t - del) / .4))) : 1;                        // تقدّم حركة الدخول

    if (inf && p <= 0) { badge(cy, lb, 0, 0); return; }
    badge(cy, lb, !!inf, i == 0);
    if (inf) {
      g.save();
      g.globalAlpha = c01(p);
      g.translate((1 - c01(p)) * -60, 0);                                                          // انزلاق من اليسار
      strip(182, cy - 33, 330, 66, inf.k, String(inf.yr), "موسم " + inf.n);
      g.restore();
    }
    if (i >= 10) { rect(182, cy - 33, 330, 66, YE); T(lb == "R" ? "الاعتزال" : "التدريب", 347, cy, 32, INK, "center", 300); }
  });
}

/* ---------- 2) لوحة المعلومات (الجانب الأيمن) ---------- */

// خانة أيقونة مربعة: g كرة أرضية، p دبوس موقع، وغيرها يورو
function icon(x, y, w, h, kd) {
  rect(x, y, w, h, PU);
  g.strokeStyle = INK; g.lineWidth = 5; g.strokeRect(x + 6, y + 6, w - 12, h - 12);
  const cx = x + w / 2, cy = y + h / 2;
  g.lineWidth = 4; g.beginPath();
  if (kd == "g") { g.arc(cx, cy, 20, 0, 7); g.moveTo(cx - 20, cy); g.lineTo(cx + 20, cy); g.moveTo(cx, cy - 20); g.lineTo(cx, cy + 20); g.stroke(); g.beginPath(); g.ellipse(cx, cy, 9, 20, 0, 0, 7); g.stroke(); }
  else if (kd == "p") { g.arc(cx, cy - 6, 17, 0, 7); g.stroke(); g.beginPath(); g.moveTo(cx - 12, cy + 6); g.lineTo(cx, cy + 26); g.lineTo(cx + 12, cy + 6); g.stroke(); }
  else T("€", cx, cy + 2, 50, INK);
}

// لوحة المعلومات: المنطقة، المركز، العمر، التقييم، القيمة، النادي الحالي
function info(s) {
  const c = s.c, x = 638, w = 330;
  const v = c ? val(c.ovr, c.age, c.rep) : val(60, 17, 5);

  icon(x, 190, 72, 78, "g"); rect(x + 82, 190, w - 82, 78, PU);
  T("إفريقيا", x + 82 + (w - 82) / 2, 229, 38, INK, "center", w - 100);

  icon(x, 278, 72, 70, "p"); rect(x + 82, 278, w - 82, 70, PU);
  T(POS[c ? c.pos : s.pos], x + 82 + (w - 82) / 2, 313, 36, INK, "center", w - 100);

  // صف بيانات: خانة بيضاء للعنوان وسوداء للقيمة
  const st = (y, l, t) => {
    rect(x, y, 140, 72, PU); T(l, x + 70, y + 36, 40, INK);
    rect(x + 150, y, w - 150, 72, DK); T(t, x + 150 + (w - 150) / 2, y + 38, 50, WH, "center", w - 170);
  };
  st(358, "العمر", "" + (c ? c.age : 17));
  if (c) st(440, "التقييم", "" + c.ovr);

  icon(x, 522, 72, 78, "m"); rect(x + 82, 522, w - 82, 78, DK);
  T(fm(v), x + 82 + (w - 82) / 2, 562, 52, WH, "center", w - 100);

  if (c) {
    rect(x, 620, w, 52, PU); T("النادي الحالي", x + w / 2, 647, 36, INK);
    const sp = c.log.length ? spell(c, c.log[c.log.length - 1].age) : null;
    strip(x, 672, w, 78, CL[c.cid], String(sp ? sp.yr : 2026), "موسم " + (sp ? sp.n : 1));
  }
}

/* ---------- 3) طبقة مؤقتة (Cache) للسلّم واللوحة ----------
   السلّم واللوحة ثقيلان ونادراً ما يتغيران، فنرسمهما على canvas منفصل
   ولا نعيد الرسم إلا إذا تغيّرت البيانات (المفتاح lkey) */
const LY = document.createElement("canvas");
LY.width = 720; LY.height = 540;
const lg = LY.getContext("2d");
let lkey = "";

function layer(s) {
  const c = s.c;
  const key = c ? [c.log.length, c.cid, c.ovr, c.age, c.rep].join("|") : "n" + s.pos;
  if (key != lkey) {
    lkey = key;
    const o = g;
    g = lg;                                   // الرسم مؤقتاً على الطبقة
    lg.setTransform(RES, 0, 0, RES, 0, 0);
    lg.clearRect(0, 0, W, 810);
    ladder(s, 99);
    info(s);
    g = o;
  }
  g.drawImage(LY, 0, 0, W, 810);              // نسخ الطبقة إلى الشاشة
}

/* ---------- 4) اللافتات والصفوف القابلة للضغط ---------- */

// تقسيم نص عربي إلى أسطر حسب أقصى عرض
function wrap(tx, mw, z) {
  g.direction = "rtl";
  g.font = `800 ${z}px ${F}`;
  const L = [];
  let cu = "";
  for (const w of tx.split(" ")) {
    const n = cu ? cu + " " + w : w;
    if (g.measureText(n).width > mw && cu) { L.push(cu); cu = w; } else cu = n;
  }
  L.push(cu);
  return L;
}

// لافتة خضراء بعنوان + صندوق أسود بالنص، تدخل بحركة ارتداد
function banner(y, ti, tx, t) {
  const p = c01(eob(c01(t / .25)));
  g.save();
  g.globalAlpha = c01(p);
  g.translate(0, (1 - c01(p)) * 60);
  rect(250, y, 580, 86, GR);
  rect(250, y, 96, 86, "#0e8a50");
  shield(298, y + 43, 28);
  T(ti, 588, y + 44, 40, WH, "center", 470);
  const L = wrap(tx, 740, 40);
  rect(143, y + 92, 794, 36 + L.length * 48, DK);
  L.forEach((l, i) => T(l, 540, y + 134 + i * 48, 40, WH, "center", 760, 700));
  g.restore();
}

// حركة ظهور الصف رقم i، وتعتيم الصفوف غير المختارة بعد الاختيار
const fade = (s, i, t) => ({
  p: c01(eob(c01((t - .05 - i * .03) / .25))),
  d: s.picked != null && s.picked != i ? .3 : 1
});

// إطار أصفر نابض حول الصف المختار
function hl(r, s, i) {
  if (s.picked != i) return;
  const k = Math.sin(c01((performance.now() - s.pa) / PICK) * Math.PI);
  g.lineWidth = 8; g.strokeStyle = YE;
  g.strokeRect(r.x - 4 - k * 4, r.y - 4 - k * 4, r.w + 8 + k * 8, r.h + 8 + k * 8);
}

// مواضع الأزرار لكل مرحلة (تُستعمل للرسم ولمناطق اللمس معاً)
function layout(st, n) {
  if (st == "club")    return Array.from({ length: n }, (_, i) => i < 8
      ? { x: 55 + (i % 2) * 495, y: 1070 + (i >> 1) * 118, w: 475, h: 104 }     // 8 أندية (عمودان × 4)
      : { x: 55 + (i - 8) * 495, y: 1550, w: 475, h: 82 });                      // زرّا السابق/التالي
  if (st == "focus")   return Array.from({ length: n }, (_, i) => ({ x: 55 + (i % 2) * 495, y: 1070 + (i >> 1) * 125, w: 475, h: 112 }));
  if (st == "offers")  return Array.from({ length: n }, (_, i) => ({ x: 108, y: 1192 + i * 116, w: 780, h: 106 }));
  if (st == "chapter") return [{ x: 290, y: 1700, w: 500, h: 100 }];
  if (st == "final")   return [{ x: 290, y: 1720, w: 500, h: 100 }];
  return [];
}

// رسم صفوف المرحلة بحركة دخول وتمييز المختار
function rows(s, t, items, draw) {
  layout(s.stage, items).forEach((r, i) => {
    const { p, d } = fade(s, i, t);
    if (p <= 0) return;
    g.save();
    g.globalAlpha = c01(p) * d;
    g.translate((1 - c01(p)) * -80, 0);
    draw(r, i);
    hl(r, s, i);
    g.restore();
  });
}

/* ---------- 5) البطاقة النهائية ---------- */

// قصاصات ملونة متساقطة للاحتفال
function confetti(t, d = 1) {
  const pl = [YE, GR, WH, "#38bdf8", "#ff5a5a"];
  for (let i = 0; i < 45 * d; i++) {
    g.save();
    g.translate((i * 137) % W + Math.sin(t * 2 + i) * 30, (t * (260 + (i % 5) * 60) + i * 97) % H);
    g.rotate(t * 3 + i);
    g.fillStyle = pl[i % 5];
    g.fillRect(-8, -4, 16, 8);
    g.restore();
  }
}

function drawFinal(s, now) {
  const c = s.c, t = (now - s.tf) / 1000, L = legacy(c);
  const sm = x => c.log.reduce((a, l) => a + l[x], 0);

  layer(s);

  // اللافتة الصفراء وصندوق التصنيف (أسطورة، نجم...) مع الأفاتار
  const p = c01(eob(c01(t / .5)));
  g.save();
  g.globalAlpha = c01(p);
  g.translate(0, (1 - c01(p)) * 60);
  rect(143, 820, 794, 86, YE); T("اكتملت المسيرة", 540, 864, 54, INK);
  rect(143, 906, 794, 150, DK);
  avatarDraw(AVSEL, 215, 981, 52);
  T(L.t, 610, 950, 66, YE, "center", 600);
  T(c.name + " · نقاط الإرث " + L.p, 610, 1004, 30, "#d5dbe6", "center", 600);
  if (S.rank) T("ترتيبك " + S.rank.pos + " من " + S.rank.n, 610, 1038, 26, WH, "center", 600);
  g.restore();

  // 12 إحصائية تظهر تباعاً (عمودان × 6 صفوف)
  [["مباريات", sm("ap")], ["أهداف", sm("go")], ["تمريرات", sm("as")], ["مع المنتخب", c.caps],
   ["الدوريات", c.lg], ["ألقاب قارية", c.ct], ["أمم إفريقيا", c.af], ["كأس العالم", c.wc],
   ["الكرة الذهبية", c.bo], ["الحذاء الذهبي", c.gb], ["أعلى تقييم", c.peak], ["أعلى قيمة", fm(c.pv)]
  ].forEach(([l, v], i) => {
    const x = 108 + (i % 2) * 440, y = 1090 + (i >> 1) * 96;
    const q = c01(eob(c01((t - .4 - i * .07) / .4)));
    if (q <= 0) return;
    g.save();
    g.globalAlpha = c01(q);
    g.translate(0, (1 - c01(q)) * 40);
    rect(x, y, 200, 80, PU);       T(l, x + 100, y + 41, 28, INK, "center", 185);
    rect(x + 206, y, 200, 80, DK); T("" + v, x + 306, y + 42, 46, WH, "center", 185);
    g.restore();
  });

  if (S.snap) return;                                   // أثناء التقاط الصورة لا نرسم الزر
  if (L.p >= 75 || c.bo || c.wc) confetti(t);           // احتفال للنجوم والأساطير
  rect(290, 1720, 500, 100, YE);
  T(FAN ? "حفظ بطاقة المسيرة" : "إنهاء وحفظ الفيديو", 540, 1771, 42, INK, "center", 460);
}

/* ---------- 6) الخلفية: الكاميرا أو الملعب ---------- */

// 0 = ملء الإطار بالكامل (قص أكبر) · 1 = عرض الكاميرا بعرض الإطار (حواف داكنة أعلى وأسفل)
const CAM_FIT = 0;

// رسم الكاميرا بوضع المرآة وملء الإطار 9:16
function drawCam() {
  const vw = vid.videoWidth, vh = vid.videoHeight;
  if (!vw) return;
  const kc = Math.max(W / vw, H / vh), kw = W / vw;
  const k = kc + (kw - kc) * CAM_FIT, w = vw * k, h = vh * k;
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = "low";
  g.save();
  g.translate(W, 0); g.scale(-1, 1);                    // قلب أفقي (مرآة)
  g.drawImage(vid, (W - w) / 2, (H - h) / 2, w, h);
  g.restore();
}

// ملعب مرسوم لوضع المعجبين (بدون كاميرا)
function drawPitch() {
  const k = g.createLinearGradient(0, 0, 0, H);
  k.addColorStop(0, "#06130c"); k.addColorStop(1, "#0c2a1a");
  g.fillStyle = k; g.fillRect(0, 0, W, H);
  g.strokeStyle = "#1fa46355"; g.lineWidth = 5;
  g.strokeRect(70, 120, W - 140, H - 240);                                  // حدود الملعب
  g.beginPath(); g.moveTo(70, H / 2); g.lineTo(W - 70, H / 2); g.stroke();  // خط المنتصف
  g.beginPath(); g.arc(W / 2, H / 2, 150, 0, 7); g.stroke();                // دائرة المنتصف
  g.strokeRect(300, 120, W - 600, 200);                                     // منطقة جزاء علوية
  g.strokeRect(300, H - 320, W - 600, 200);                                 // منطقة جزاء سفلية
}

/* ---------- 7) العدّ التنازلي السينمائي (3 · 2 · 1 · انطلق) ---------- */
let CVG;   // تدرّج الإطار المعتم (يُنشأ مرة واحدة)

function drawCount(now) {
  const t = Math.max(0, (now - S.t0) / 1000);
  const go = t >= 3;                           // هل انتهى العدّ؟
  const i = Math.min(Math.floor(t), 2);        // رقم الثانية الحالية
  const f = go ? t - 3 : t - i;                // تقدّم الثانية (0 إلى 1)
  const n = 3 - i;                             // الرقم المعروض
  const cx = 540, cy = 930, R0 = 250;

  // تعتيم الخلفية وإطار معتم حول الحواف
  g.fillStyle = "#0000008c"; g.fillRect(0, 0, W, H);
  if (!CVG) {
    CVG = g.createRadialGradient(cx, cy, 260, cx, cy, 1150);
    CVG.addColorStop(0, "#00000000"); CVG.addColorStop(1, "#000000d9");
  }
  g.fillStyle = CVG; g.fillRect(0, 0, W, H);

  // كبسولة "استعد للانطلاق"
  const pa = c01(t / .35);
  g.save();
  g.globalAlpha = pa; g.translate(0, (1 - pa) * -30);
  g.beginPath(); g.roundRect(270, 520, 540, 92, 46); g.fillStyle = YE; g.fill();
  T("استعد للانطلاق", 540, 567, 42, INK, "center", 480);
  g.restore();

  // الحلقة الأساسية
  g.save();
  g.lineCap = "round"; g.lineWidth = 24; g.strokeStyle = "#ffffff2e";
  g.beginPath(); g.arc(cx, cy, R0, 0, Math.PI * 2); g.stroke();

  if (!go) {
    // حلقة صفراء تتناقص مع الوقت + موجة بيضاء متمددة + الرقم الكبير
    g.shadowColor = YE; g.shadowBlur = 18; g.strokeStyle = YE;
    g.beginPath(); g.arc(cx, cy, R0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - f)); g.stroke();
    g.shadowBlur = 0;
    g.globalAlpha = (1 - f) * .5; g.lineWidth = 6; g.strokeStyle = WH;
    g.beginPath(); g.arc(cx, cy, R0 + 30 + f * 150, 0, Math.PI * 2); g.stroke();
    g.globalAlpha = 1;
    const sc = 1 + .5 * (1 - eoc(c01(f / .35))), al = c01((1 - f) / .15);   // نبضة تكبير ثم تلاشٍ
    g.translate(cx, cy + 10); g.scale(sc, sc); g.globalAlpha = al;
    g.shadowColor = "#ffd21acc"; g.shadowBlur = 22;
    T("" + n, 0, 0, 340, WH, "center", 0, 900);
  } else {
    // لحظة الانطلاق: حلقة كاملة + انفجار + كلمة "انطلق!"
    g.shadowColor = YE; g.shadowBlur = 22; g.strokeStyle = YE;
    g.beginPath(); g.arc(cx, cy, R0, 0, Math.PI * 2); g.stroke();
    g.shadowBlur = 0;
    const q = c01(f / .5);
    g.globalAlpha = (1 - q) * .7; g.lineWidth = 10; g.strokeStyle = YE;
    g.beginPath(); g.arc(cx, cy, R0 + q * 420, 0, Math.PI * 2); g.stroke();
    g.globalAlpha = 1;
    const sc = .7 + .3 * eob(c01(f / .3));
    g.translate(cx, cy + 8); g.scale(sc, sc);
    g.shadowColor = "#ffd21acc"; g.shadowBlur = 22;
    T("انطلق!", 0, 0, 170, YE, "center", 440, 900);
  }
  g.restore();

  // نقاط التقدّم الثلاث
  for (let d = 0; d < 3; d++) {
    g.beginPath();
    g.arc(cx + (d - 1) * 56, 1270, go || d <= i ? 15 : 11, 0, Math.PI * 2);
    g.fillStyle = go || d <= i ? YE : "#ffffff40";
    g.fill();
  }

  // العنوان في الأسفل
  g.save();
  g.shadowColor = "#000000b0"; g.shadowBlur = 10;
  T("طريق الأسطورة", 540, 1370, 70, WH, "center", 760, 900);
  g.shadowBlur = 0;
  T("ابنِ مسيرتك من 17 إلى 38 سنة", 540, 1450, 34, "#ffffffd0", "center", 760);
  g.restore();
}

/* ---------- 8) الإطار الرئيسي: يُستدعى كل إطار لرسم المرحلة الحالية ---------- */
function frame(now) {
  // تهيئة الرسم: التحجيم للدقة المنخفضة (RES) وخلفية داكنة
  g.setTransform(RES, 0, 0, RES, 0, 0);
  g.textBaseline = "middle";
  g.fillStyle = "#111"; g.fillRect(0, 0, W, H);
  if (FAN) drawPitch(); else drawCam();

  const s = S;

  if (s.ph == "done") { /* لا شيء: الشاشة ثابتة */ }
  else if (s.ph == "final") drawFinal(s, now);
  else if (s.ph == "count") drawCount(now);
  else if (s.ph == "setup") {
    // شاشة الترحيب قبل بدء العدّ
    rect(120, 800, 840, 130, YE); T("طريق الأسطورة", 540, 865, 84, INK, "center", 800);
    rect(120, 930, 840, 120, DK); T("اختر ناديك، اتخذ قراراتك، وكن أسطورة.", 540, 990, 40, WH, "center", 800);
  }
  else {
    // مراحل اللعب: السلّم + اللوحة + شاشة المرحلة
    const t = s.stage == "chapter" ? 99 : (now - Math.max(s.st, s.tp)) / 1000;
    layer(s);
    T("v1.3.0", W / 2, 62, 26, "#ffffffe6");

    if (s.stage == "club") {
      /* --- اختيار النادي الأول (8 أندية في كل صفحة + سابق/تالي) --- */
      banner(830, "اختر ناديك الأول",
        `أكثر من ${START.length} نادياً من دوريات متعددة · صفحة ${clubPage + 1}/${Math.ceil(START.length / CLUB_PAGE_SIZE)}`, t);
      rows(s, t, 10, (r, i) => {
        if (i < 8) {
          const k = START[clubPage * CLUB_PAGE_SIZE + i];
          if (k) strip(r.x, r.y, r.w, r.h, k, "القوة", "" + k.s, k.c1 == "#ffffff" ? k.c2 : k.c1);
        } else {
          g.beginPath(); g.roundRect(r.x, r.y, r.w, r.h, 16);
          g.fillStyle = i == 8 ? PU : YE; g.fill();
          T(i == 8 ? "السابق" : "التالي", r.x + r.w / 2, r.y + r.h / 2 + 2, 36, INK, "center", r.w - 160, 900);
          chev(i == 8 ? r.x + 48 : r.x + r.w - 48, r.y + r.h / 2, i == 8 ? -1 : 1, INK);
        }
      });
    }
    else if (s.stage == "focus") {
      /* --- اختيار عقلية المسيرة (8 خيارات) --- */
      banner(830, "اختر عقلية مسيرتك", "قراراتك تؤثر في الثقة والضغط والإصابات والتطور وفرص الانتقال.", t);
      rows(s, t, 8, (r, i) => {
        const o = FOC[i];
        g.save();
        g.beginPath(); g.roundRect(r.x, r.y, r.w, r.h, 16); g.clip();
        rect(r.x, r.y, r.w, r.h, DK);
        fico(o[3], r.x + 58, r.y + r.h / 2, FC[i]);
        T(o[0], r.x + r.w - 20, r.y + 37, 29, WH, "right", r.w - 110, 900);
        T(o[1], r.x + r.w - 20, r.y + 80, 23, "#aeb8c8", "right", r.w - 110, 700);
        g.lineWidth = 7; g.strokeStyle = FC[i];
        g.beginPath(); g.roundRect(r.x, r.y, r.w, r.h, 16); g.stroke();
        g.restore();
      });
    }
    else if (s.stage == "offers") {
      /* --- عروض الانتقال والتجديد والإعارة --- */
      const mv = s.offers.filter(o => o.kind != "renew").length;   // عدد عروض الانتقال الفعلية
      banner(950,
        mv ? (mv == 1 ? "نادٍ واحد مهتم" : mv == 2 ? "ناديان مهتمان" : mv + " أندية مهتمة") : "العقد ينتهي",
        mv >= 3 ? "أندية كبيرة تتصارع على توقيعك، فاختر بحكمة!"
        : mv == 2 ? "ناديان يتنافسان على ضمّ موهبتك في صفقة انتقال مثيرة!"
        : mv ? "نادٍ قدّم عرضه. هل هي الخطوة الصحيحة لمسيرتك؟"
        : "عقدك انتهى. هل تبقى مع النادي الذي صنعك؟", t);
      rows(s, t, s.offers.length, (r, i) => {
        const o = s.offers[i];
        strip(r.x, r.y, r.w, r.h, o.k, o.role, fm(o.w), RC[o.role],
          (o.kind == "renew" ? "تجديد · " : o.kind == "loan" ? "إعارة · " : "")
          + o.k.country + " · " + o.k.league + " · " + o.yrs + " سنوات");
      });
    }
    else {
      /* --- ملخص الفصل: إحصائيات + أهم 5 أحداث + زر المتابعة --- */
      const h = s.ch, d = h.o1 - h.o0;
      banner(950, `من ${h.a} إلى ${h.b} سنة`,
        `${h.ap} مباراة، ${h.go} هدفاً، ${h.as} تمريرة حاسمة و${h.t} ألقاب. التقييم من ${h.o0} إلى ${h.o1} (${d >= 0 ? "زيادة" : "نقص"} ${Math.abs(d)}).`, 99);

      h.ev.slice(0, 5).forEach((e, i) => {
        const star = /🏆|🥇|👟/.test(e);                         // الألقاب بلون أصفر
        const y = 1262 + i * 78;
        const tx = e.replace(/^\d+: /, "");                      // إزالة العمر من بداية النص
        g.save();
        g.beginPath(); g.roundRect(108, y, 840, 70, 14); g.clip();
        rect(108, y, 840, 70, DK);
        rect(108, y, 9, 70, star ? YE : PU);
        T(tx.replace(EMO, ""), 886, y + 36, 31, WH, "right", 600, 700);
        rect(128, y, 120, 70, star ? YE : PU);
        T(e.startsWith("99") ? "النهاية" : "عمر " + e.split(":")[0], 188, y + 36, 27, INK, "center", 108);
        g.lineWidth = 6; g.strokeStyle = star ? YE : "#ffffff73";
        g.beginPath(); g.roundRect(108, y, 840, 70, 14); g.stroke();
        g.restore();
        eico(tx, 918, y + 35, star ? YE : PU);
      });

      rect(290, 1700, 500, 100, YE);
      T(h.end ? "عرض بطاقة المسيرة" : "متابعة", 540, 1751, 46, INK, "center", 460);
    }
  }

  // توقيع اللعبة أسفل كل الشاشات
  T("طريق الأسطورة", W / 2, 1885, 30, "#ffffffb0");
}
