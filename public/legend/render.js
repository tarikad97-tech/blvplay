"use strict";
/* ==========================================================
   render.js (الجزء 1) — أدوات الرسم الأساسية على canvas
   يشمل: الألوان، النص، الشعارات، الشرائط، الأيقونات، الأفاتار
   ملاحظة: يعتمد على متغيرات عامة تُعرَّف في main.js:
   g (سياق الرسم) · W · H · S · FAN · vid   (أما AVSEL فمعرّف هنا في قسم الأفاتار)
   الشاشات والإطار الكامل في screens.js
   ========================================================== */

/* ---------- 1) الألوان والخط ---------- */
const PU = "#fff";      // أبيض (خلفية الشرائط الفاتحة)
const DK = "#0d0d0d";   // أسود داكن
const YE = "#ffd21a";   // أصفر
const GR = "#12b76a";   // أخضر
const GY = "#23272f";   // رمادي داكن
const INK = "#0d0d0d";  // لون الحبر للنصوص على الخلفيات الفاتحة
const WH = "#fff";      // أبيض
const F = '"Tajawal","Cairo","Segoe UI","Noto Sans Arabic",Tahoma,sans-serif';   // الخطوط

// ألوان دور اللاعب في النادي
const RC = {
  "نجم الفريق": "#17b26a", "لاعب أساسي": "#ffd21a", "بديل متناوب": "#f2a33c",
  "احتياطي": "#ff5a5a", "مهمَّش": "#c8102e"
};

// أعمار سلّم المسيرة الظاهر على اليسار
const LAD = [17, 18, 20, 22, 24, 26, 28, 30, 32, 34];

// خيارات العقلية: [العنوان، الوصف، الأيقونة، المفتاح]
const FOC = [
  ["التطوير أولاً",      "تدريب مكثف؛ نمو أسرع مع إجهاد أعلى",          "🏋", "train"],
  ["التعافي الذكي",      "راحة أفضل وتقليل خطر الإصابة",                "🩺", "rest"],
  ["طموح بلا تهور",      "دقائق أكثر وفرص أكبر مع ضغط بدني",            "🔥", "push"],
  ["الثقة وإدارة الضغط", "ثبات ذهني وأداء أفضل في المباريات الكبيرة",   "🧠", "mind"],
  ["الاحتراف بالخارج",   "فرص انتقال أقوى لكن تأقلم أصعب",              "✈️", "abroad"],
  ["الاستقرار المحلي",   "تأقلم أسرع وفرصة أوضح للمنتخب",               "🇲🇦", "home"],
  ["قائد غرفة الملابس",  "انسجام وسمعة أفضل وتأثير جماعي",              "🤝", "team"],
  ["ذكاء تكتيكي",        "تمركز وقرارات أفضل وتقييم أكثر ثباتاً",       "♟️", "tactics"]
];
const FC = [GR, YE, "#f2a33c", "#6d5bd0", "#38a7d8", "#d62839", "#e879a9", "#667085"];   // ألوان أيقونات العقلية

/* ---------- 2) أدوات رسم بسيطة ---------- */

// تنسيق المبلغ: €12M
const fm = m => "€" + (m >= 10 ? Math.round(m) : m) + "M";

// مستطيل ملوّن
const rect = (x, y, w, h, f) => { g.fillStyle = f; g.fillRect(x, y, w, h); };

// ذاكرة مؤقتة لقياس عرض النصوص (القياس مكلف في كل إطار)
const WM = new Map();

/* رسم نص مع ضبط تلقائي للاتجاه (عربي/إنجليزي)
   s: النص، x,y: الموضع، z: حجم الخط، c: اللون، al: المحاذاة،
   mw: أقصى عرض (يصغّر الخط تلقائياً إن تجاوزه)، wt: سماكة الخط */
const T = (s, x, y, z, c = INK, al = "center", mw, wt = 800) => {
  g.direction = /[\u0600-\u06FF]/.test(s) ? "rtl" : "ltr";
  let fk = `${wt} ${z}px ${F}`;
  g.font = fk;

  if (mw) {
    const key = fk + s;
    let w = WM.get(key);
    if (w == null) {
      w = g.measureText(s).width;
      if (WM.size > 3000) WM.clear();     // تفريغ الذاكرة إذا كبرت
      WM.set(key, w);
    }
    if (w > mw) {                          // تصغير الخط ليناسب العرض (حد أدنى 12px)
      fk = `${wt} ${Math.max(12, z * mw / w * .98)}px ${F}`;
      g.font = fk;
    }
  }
  g.fillStyle = c;
  g.textAlign = al;
  g.textBaseline = "middle";
  g.fillText(s, x, y);
};

// السهم المستعمل في أزرار السابق/التالي
function chev(x, y, d, c) {
  g.save();
  g.strokeStyle = c; g.lineWidth = 7; g.lineCap = g.lineJoin = "round";
  g.beginPath();
  g.moveTo(x - d * 8, y - 16);
  g.lineTo(x + d * 8, y);
  g.lineTo(x - d * 8, y + 16);
  g.stroke();
  g.restore();
}

/* ---------- 3) شعارات الأندية ---------- */
const logos = {};                          // صور شعارات حقيقية (اختيارية) بمفتاح معرّف النادي
const logo = id => logos[id] || null;

// شكل الدرع ونمطه لكل نادٍ: الحرف الأول (S درع، C دائرة) والثاني نمط الألوان
// V خطوط عمودية · H نصف · B شريط أفقي · G قطري · D معينات · X إطار
const SP = {
  barca: "SV", milan: "SV", juve: "SV", atalanta: "SV", atletico: "SV", fenerbahce: "SV",
  newcastle: "CV", bayern: "CD", far: "SG", fiorentina: "SG", monaco: "SG", nice: "SG",
  psg: "CB", ajax: "CB", feyenoord: "CB", berkane: "CB",
  benfica: "SH", porto: "SH", sporting: "SH", galatasaray: "SH", villa: "SH"
};

// رسم الشعار مباشرة (بدون ذاكرة مؤقتة)
function crestRaw(k, x, y, r) {
  g.save();
  g.translate(x, y);
  g.shadowColor = "#0009";
  g.shadowBlur = r * .3;

  const im = logo(k.id);
  const sp = SP[k.id] || (["MA", "GB", "DE", "FR", "IT", "ES"].includes(k.cc) ? "CX" : "SX");

  if (im) {
    // شعار حقيقي: دائرة بيضاء والصورة داخلها
    g.beginPath(); g.arc(0, 0, r, 0, 7); g.fillStyle = WH; g.fill();
    g.shadowBlur = 0;
    const z = r * 1.5 / Math.max(im.width, im.height);
    g.drawImage(im, -im.width * z / 2, -im.height * z / 2, im.width * z, im.height * z);
  } else {
    // شعار مرسوم: نبني مسار الدرع أو الدائرة
    const P = new Path2D();
    if (sp[0] == "C") P.arc(0, 0, r, 0, 7);
    else {
      P.moveTo(-r * .85, -r * .9);
      P.lineTo(r * .85, -r * .9);
      P.lineTo(r * .85, r * .15);
      P.quadraticCurveTo(r * .85, r * .75, 0, r);
      P.quadraticCurveTo(-r * .85, r * .75, -r * .85, r * .15);
      P.closePath();
    }
    g.fillStyle = "#f7f4e9"; g.fill(P);                       // حافة كريمية
    g.save(); g.scale(.91, .91); g.fillStyle = k.c1; g.fill(P); g.restore();   // اللون الأول
    g.shadowBlur = 0;

    // النمط بلون النادي الثاني داخل حدود الدرع
    g.save(); g.clip(P); g.fillStyle = k.c2;
    const q = sp[1];
    if (q == "V") { for (let i = 1; i < 5; i += 2) g.fillRect(-r + i * r * .4, -r, r * .4, 2 * r); }
    else if (q == "H") g.fillRect(0, -r, r, 2 * r);
    else if (q == "B") g.fillRect(-r, -r * .3, 2 * r, r * .6);
    else if (q == "G") { g.beginPath(); g.moveTo(-r, -r); g.lineTo(r, -r); g.lineTo(-r, r); g.fill(); }
    else if (q == "D") {
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
        g.save(); g.translate(i * r * .55, j * r * .55); g.rotate(Math.PI / 4);
        g.fillRect(-r * .15, -r * .15, r * .3, r * .3); g.restore();
      }
    } else {
      g.lineWidth = r * .12; g.strokeStyle = k.c2; g.beginPath();
      if (sp[0] == "C") g.arc(0, 0, r * .8, 0, 7); else g.rect(-r * .68, -r * .72, r * 1.36, r * 1.3);
      g.stroke();
    }
    g.restore();

    // إطار ذهبي، حلقة بيضاء، ثم اختصار النادي على شريط أسود
    g.lineWidth = r * .12; g.strokeStyle = "#f4d477"; g.stroke(P);
    g.lineWidth = r * .045; g.strokeStyle = "#ffffffdd";
    g.beginPath(); g.arc(0, -r * .05, r * .68, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#000b"; g.fillRect(-r * .68, r * .28, r * 1.36, r * .42);
    T(k.ab, 0, r * .49, r * (k.ab.length > 3 ? .28 : .35), WH, "center", r * 1.24, 900);
  }
  g.restore();
}

// ذاكرة مؤقتة للشعارات: نرسم كل شعار مرة واحدة ثم ننسخه كصورة (أسرع بكثير)
const SPR = {};
function crest(k, x, y, r) {
  const key = k.id + "|" + Math.round(r);
  const im = logo(k.id);
  let sp = SPR[key];

  // نعيد البناء إن لم يوجد، أو إن وصل الشعار الحقيقي بعد رسم النسخة المبسطة
  if (!sp || (im && !sp.l)) {
    const o = Math.ceil(r * 1.5);
    const c = document.createElement("canvas");
    c.width = c.height = o * 2;
    const cx = c.getContext("2d");
    const old = g;
    g = cx;                                 // نحوّل الرسم مؤقتاً إلى canvas الشعار
    cx.setTransform(1, 0, 0, 1, 0, 0);
    crestRaw(k, o, o, r);
    g = old;
    sp = SPR[key] = { c, o, l: !!im };
  }
  g.drawImage(sp.c, x - sp.o, y - sp.o);
}

/* ---------- 4) شريط النادي (الشعار + الاسم + الدولة + خانة بيضاء بقيمتين) ----------
   a: السطر العلوي في الخانة، b: السطر السفلي، acc: لون الشريط الجانبي، sub: نص بديل لاسم الدولة */
function strip(x, y, w, h, k, a, b, acc, sub) {
  g.save();
  g.beginPath(); g.roundRect(x, y, w, h, 14); g.clip();
  rect(x, y, w, h, DK);
  if (acc) rect(x, y, 9, h, acc);
  crest(k, x + h * .62, y + h / 2, h * .36);

  const tw = Math.max(96, h * 1.5);          // عرض الخانة البيضاء
  const l = x + h * 1.12;                    // بداية النص
  const mw = w - h * 1.12 - tw - 16;         // أقصى عرض للنص

  T(k.ar, l, y + h * .34, h * .36, WH, "left", mw);
  T(k.flag + " " + (sub || k.country), l, y + h * .72, h * .25, "#aeb8c8", "left", mw, 700);

  rect(x + w - tw, y + h * .3, tw, h * .7, PU);
  T(a, x + w - tw / 2, y + h * .48, h * .2, INK, "center", tw - 10);
  T(b, x + w - tw / 2, y + h * .78, h * .24, INK, "center", tw - 10);

  g.lineWidth = 6; g.strokeStyle = "#ffffff73";
  g.beginPath(); g.roundRect(x, y, w, h, 14); g.stroke();
  g.restore();
}

/* ---------- 5) أيقونات أحداث المسيرة ---------- */
const EMO = /^(?:\p{RI}{2}|\p{Extended_Pictographic}\uFE0F?)\s*/u;   // إيموجي في بداية النص

// رسم أيقونة دائرية حسب إيموجي بداية الحدث
function eico(t, x, y, c) {
  const m = t.match(/^(?:\p{RI}{2}|\p{Extended_Pictographic})/u);
  const e = m ? m[0] : "";
  const k = ({
    "🏆": "trophy", "🥇": "medal", "🏅": "medal", "👟": "boot", "⭐": "star", "🎩": "star",
    "🤕": "cross", "🏥": "cross", "🩹": "cross", "🟥": "card", "🇲🇦": "flag", "🔥": "flame",
    "📉": "down", "🎯": "target", "🌍": "globe", "👑": "crown", "💥": "spark", "📺": "tv",
    "📰": "doc", "↩": "arrow", "🎽": "whistle"
  })[e] || "dot";
  const q = c == YE || c == PU ? INK : WH;   // لون الرسمة حسب الخلفية

  g.save();
  g.translate(x, y);
  g.beginPath(); g.arc(0, 0, 27, 0, 7); g.fillStyle = c; g.fill();
  g.fillStyle = g.strokeStyle = q; g.lineWidth = 4; g.lineCap = g.lineJoin = "round";
  g.beginPath();

  if (k == "trophy") {
    g.moveTo(-9, -12); g.lineTo(9, -12); g.lineTo(7, 2); g.quadraticCurveTo(0, 8, -7, 2); g.closePath(); g.fill();
    g.fillRect(-2, 6, 4, 6); g.fillRect(-8, 12, 16, 3);
    g.beginPath(); g.moveTo(-9, -9); g.quadraticCurveTo(-17, -9, -11, -1);
    g.moveTo(9, -9); g.quadraticCurveTo(17, -9, 11, -1); g.stroke();
  }
  else if (k == "medal") { g.arc(0, 4, 9, 0, 7); g.fill(); g.beginPath(); g.moveTo(-6, -14); g.lineTo(-2, -3); g.moveTo(6, -14); g.lineTo(2, -3); g.stroke(); }
  else if (k == "boot") { g.moveTo(-12, -8); g.lineTo(-3, -8); g.lineTo(-3, 2); g.lineTo(10, 6); g.quadraticCurveTo(13, 7, 13, 10); g.lineTo(-12, 10); g.closePath(); g.fill(); }
  else if (k == "star") { for (let i = 0; i < 10; i++) { const r = i % 2 ? 6 : 14, a = -Math.PI / 2 + i * Math.PI / 5; g[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); }
  else if (k == "cross") { g.fillRect(-3, -11, 6, 22); g.fillRect(-11, -3, 22, 6); }
  else if (k == "card") { g.fillStyle = "#d62839"; g.fillRect(-8, -12, 16, 24); }
  else if (k == "flag") { g.moveTo(-8, -13); g.lineTo(-8, 13); g.stroke(); g.fillRect(-8, -13, 18, 11); }
  else if (k == "flame") { g.moveTo(0, -14); g.bezierCurveTo(9, -5, 11, 1, 7, 9); g.bezierCurveTo(5, 13, -5, 13, -7, 9); g.bezierCurveTo(-11, 1, -4, -4, 0, -14); g.fill(); }
  else if (k == "down") { g.moveTo(-11, -8); g.lineTo(-3, 0); g.lineTo(2, -4); g.lineTo(11, 8); g.moveTo(11, 0); g.lineTo(11, 8); g.lineTo(3, 8); g.stroke(); }
  else if (k == "target") { g.arc(0, 0, 12, 0, 7); g.stroke(); g.beginPath(); g.arc(0, 0, 6, 0, 7); g.stroke(); g.beginPath(); g.arc(0, 0, 2, 0, 7); g.fill(); }
  else if (k == "globe") { g.arc(0, 0, 12, 0, 7); g.moveTo(-12, 0); g.lineTo(12, 0); g.stroke(); g.beginPath(); g.ellipse(0, 0, 5, 12, 0, 0, 7); g.stroke(); }
  else if (k == "crown") { g.moveTo(-11, 8); g.lineTo(-11, -6); g.lineTo(-4, 0); g.lineTo(0, -9); g.lineTo(4, 0); g.lineTo(11, -6); g.lineTo(11, 8); g.closePath(); g.fill(); }
  else if (k == "spark") { g.moveTo(0, -13); g.lineTo(3, -3); g.lineTo(13, 0); g.lineTo(3, 3); g.lineTo(0, 13); g.lineTo(-3, 3); g.lineTo(-13, 0); g.lineTo(-3, -3); g.closePath(); g.fill(); }
  else if (k == "tv") { g.rect(-12, -8, 24, 16); g.moveTo(-5, 13); g.lineTo(5, 13); g.stroke(); }
  else if (k == "doc") { g.rect(-9, -12, 18, 24); g.moveTo(-5, -4); g.lineTo(5, -4); g.moveTo(-5, 2); g.lineTo(5, 2); g.stroke(); }
  else if (k == "arrow") { g.moveTo(8, 8); g.lineTo(8, -2); g.lineTo(-6, -2); g.moveTo(-2, -8); g.lineTo(-8, -2); g.lineTo(-2, 4); g.stroke(); }
  else if (k == "whistle") { g.arc(2, 3, 9, 0, 7); g.fill(); g.fillRect(-12, -6, 12, 6); }
  else { g.arc(0, 0, 6, 0, 7); g.fill(); }
  g.restore();
}

/* ---------- 6) أيقونات خيارات العقلية (دائرة ملونة + رسمة) ---------- */
function fico(k, x, y, c) {
  g.save();
  g.translate(x, y);
  g.beginPath(); g.arc(0, 0, 36, 0, 7); g.fillStyle = c; g.fill();
  const q = c == YE ? INK : WH;
  g.fillStyle = g.strokeStyle = q; g.lineWidth = 5; g.lineCap = g.lineJoin = "round";
  g.beginPath();

  if (k == "train") { g.fillRect(-16, -3, 32, 6); g.fillRect(-24, -14, 8, 28); g.fillRect(16, -14, 8, 28); g.fillRect(-30, -8, 6, 16); g.fillRect(24, -8, 6, 16); }          // دمبل
  else if (k == "rest") { g.fillRect(-5, -18, 10, 36); g.fillRect(-18, -5, 36, 10); }                                                                                              // صليب طبي
  else if (k == "push") { g.moveTo(0, -22); g.bezierCurveTo(14, -8, 18, 2, 12, 14); g.bezierCurveTo(8, 22, -8, 22, -12, 14); g.bezierCurveTo(-18, 2, -6, -6, 0, -22); g.fill(); }   // لهب
  else if (k == "mind") { g.arc(0, -5, 14, 0, 7); g.stroke(); g.beginPath(); g.moveTo(-7, 12); g.lineTo(7, 12); g.moveTo(-5, 19); g.lineTo(5, 19); g.stroke(); }                       // مصباح
  else if (k == "abroad") { g.moveTo(0, -22); g.lineTo(5, -6); g.lineTo(22, 4); g.lineTo(22, 9); g.lineTo(5, 5); g.lineTo(3, 16); g.lineTo(9, 20); g.lineTo(9, 23); g.lineTo(0, 21); g.lineTo(-9, 23); g.lineTo(-9, 20); g.lineTo(-3, 16); g.lineTo(-5, 5); g.lineTo(-22, 9); g.lineTo(-22, 4); g.lineTo(-5, -6); g.closePath(); g.fill(); }   // طائرة
  else if (k == "home") { g.moveTo(-21, 2); g.lineTo(0, -19); g.lineTo(21, 2); g.lineTo(14, 2); g.lineTo(14, 19); g.lineTo(-14, 19); g.lineTo(-14, 2); g.closePath(); g.fill(); }        // بيت
  else if (k == "team") { g.arc(-10, -8, 7, 0, 7); g.fill(); g.beginPath(); g.arc(10, -8, 7, 0, 7); g.fill(); g.beginPath(); g.ellipse(-10, 15, 11, 10, 0, Math.PI, 0); g.fill(); g.beginPath(); g.ellipse(10, 15, 11, 10, 0, Math.PI, 0); g.fill(); }   // فريق
  else { g.moveTo(-18, -16); g.lineTo(-6, -4); g.moveTo(-6, -16); g.lineTo(-18, -4); g.moveTo(-16, 16); g.lineTo(16, 16); g.moveTo(10, 10); g.lineTo(16, 16); g.lineTo(10, 22); g.stroke(); g.beginPath(); g.arc(12, -10, 7, 0, 7); g.stroke(); }   // تكتيك
  g.restore();
}

// درع أبيض بعلامة صح خضراء (يظهر في اللافتة الخضراء)
function shield(x, y, s) {
  g.save();
  g.translate(x, y);
  g.beginPath();
  g.moveTo(0, -s); g.lineTo(s * .8, -s * .6); g.lineTo(s * .8, 0);
  g.quadraticCurveTo(s * .8, s * .7, 0, s);
  g.quadraticCurveTo(-s * .8, s * .7, -s * .8, 0);
  g.lineTo(-s * .8, -s * .6);
  g.closePath();
  g.fillStyle = WH; g.fill();
  g.beginPath(); g.moveTo(-s * .35, 0); g.lineTo(-s * .08, s * .28); g.lineTo(s * .4, -s * .28);
  g.lineWidth = s * .2; g.strokeStyle = GR; g.lineCap = g.lineJoin = "round"; g.stroke();
  g.restore();
}

/* ---------- 7) الأفاتار (صورة اللاعب الكرتونية) ----------
   كل عنصر: [لون البشرة، لون الشعر، نمط الشعر (s قصير/c مجعد/b ملتحٍ/l طويل)، لون القميص] */
const AVS = [
  ["#f1c9a5", "#2b1b12", "s", "#c8102e"], ["#c68e6b", "#111", "c", "#0a7d3a"],
  ["#8d5a3b", "#111", "b", "#1b5fbf"],    ["#f1c9a5", "#7a3b12", "l", "#ffd21a"],
  ["#e0ac86", "#111", "s", "#222"],       ["#6f4a32", "#111", "c", "#d62027"],
  ["#f1c9a5", "#caa24a", "s", "#6cabdd"], ["#c68e6b", "#2b1b12", "l", "#7a263a"],
  ["#8d5a3b", "#111", "s", "#f28c28"],    ["#e0ac86", "#5a2d12", "c", "#e8e8e8"],
  ["#6f4a32", "#111", "b", "#00a651"],    ["#f1c9a5", "#111", "b", "#5b2d8e"]
];
let AVSEL = 0;   // الأفاتار المختار حالياً

// رسم أفاتار رقم i بنصف قطر r في الموضع x,y
function avatarDraw(i, x, y, r) {
  const [skin, hair, st, kit] = AVS[i % AVS.length];
  g.save();
  g.translate(x, y);
  g.beginPath(); g.arc(0, 0, r, 0, 7); g.fillStyle = "#e8ecf3"; g.fill(); g.clip();   // خلفية دائرية

  // الجسم (القميص) والرقبة
  g.fillStyle = kit; g.beginPath(); g.ellipse(0, r * .95, r * .8, r * .5, 0, 0, 7); g.fill();
  g.fillStyle = skin; g.fillRect(-r * .14, r * .2, r * .28, r * .3);

  // الشعر الطويل خلف الوجه
  g.fillStyle = hair;
  if (st == "l") g.fillRect(-r * .42, -r * .28, r * .84, r * .8);

  // الوجه
  g.fillStyle = skin; g.beginPath(); g.ellipse(0, -r * .1, r * .36, r * .42, 0, 0, 7); g.fill();

  // الشعر أمام الوجه حسب النمط
  g.fillStyle = hair;
  if (st == "c") { for (let j = -2; j <= 2; j++) { g.beginPath(); g.arc(j * r * .17, -r * .46 + Math.abs(j) * r * .05, r * .2, 0, 7); g.fill(); } }
  else if (st == "b") { g.beginPath(); g.ellipse(0, -r * .34, r * .37, r * .14, 0, Math.PI, 0); g.fill(); }
  else { g.beginPath(); g.ellipse(0, -r * .3, r * .38, r * .26, 0, Math.PI, 0); g.fill(); }

  // العينان والابتسامة
  g.fillStyle = "#1a1a1a";
  g.beginPath(); g.arc(-r * .13, -r * .08, r * .04, 0, 7); g.fill();
  g.beginPath(); g.arc(r * .13, -r * .08, r * .04, 0, 7); g.fill();
  g.strokeStyle = "#1a1a1a"; g.lineWidth = r * .04; g.lineCap = "round";
  g.beginPath(); g.arc(0, r * .04, r * .12, .2, Math.PI - .2); g.stroke();
  g.restore();
}

// إنشاء canvas صغير يحوي أفاتار (يُستعمل في شريط الاختيار وصفوف الترتيب)
function avCanvas(i, css) {
  const c = document.createElement("canvas");
  c.width = c.height = css * 2;
  c.style.width = c.style.height = css + "px";
  const x = c.getContext("2d");
  const o = g;
  g = x;
  x.setTransform(1, 0, 0, 1, 0, 0);
  avatarDraw(i, css, css, css);
  g = o;
  return c;
}
