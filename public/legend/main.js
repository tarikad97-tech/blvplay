"use strict";
/* ==========================================================
   main.js — الملف الرئيسي (يُحمَّل أخيراً)
   التهيئة · الكاميرا والتسجيل · الترتيب · تدفق اللعبة · حلقة الرسم
   ========================================================== */

/* ---------- 1) التهيئة الأساسية ---------- */
const FAN = new URLSearchParams(location.search).get("mode") === "fan";   // وضع المعجبين: بدون كاميرا
const W = 1080, H = 1920;                                                 // أبعاد التصميم المنطقية
const $ = id => document.getElementById(id);
const cv = $("c"), vid = $("v");
let g = cv.getContext("2d", { alpha: false });   // let لأن بعض الدوال تبدّله مؤقتاً (الشعارات، الطبقات)
const RES = 720 / W;                             // نرسم بدقة 720×1280 لتخفيف الحمل على الهاتف
cv.width = 720; cv.height = 1280;

const PICK = 300;                                // مدة وميض الاختيار بالمللي ثانية

/* حالة اللعبة:
   ph: المرحلة (setup, count, play, final, done) · stage: الشاشة (club, focus, offers, chapter)
   c: اللاعب · ch: ملخص الفصل · offers: العروض · picked: الخيار المضغوط */
let S = { ph: "setup", stage: "club", st: 0, tp: 0, tf: 0, t0: 0, c: null, ch: null, offers: [], picked: null, pa: 0, name: "", pos: "W" };
let cam = null, rec = null, chunks = [];         // بث الكاميرا · المسجّل · أجزاء الفيديو

/* ---------- 2) الكاميرا ومنع انطفاء الشاشة ---------- */
async function getCam() {
  const a = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };
  if (!navigator.mediaDevices?.getUserMedia) throw new Error("CAMERA_UNAVAILABLE");
  // نبدأ بدقة خفيفة تناسب الهواتف
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "user" }, width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24, max: 30 } },
      audio: a
    });
  } catch (e) {
    // أخطاء الإذن أو عدم وجود جهاز لا يفيد معها التخفيف
    if (e && (e.name === "NotAllowedError" || e.name === "SecurityError" || e.name === "NotFoundError")) throw e;
    return await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: a });
  }
}

let WLK = null, RT0 = 0, RTI = 0;   // قفل الشاشة · بداية التسجيل · مؤقت العرض

async function wl()   { try { if (navigator.wakeLock) WLK = await navigator.wakeLock.request("screen"); } catch (e) {} }   // منع انطفاء الشاشة
function unwl()       { try { WLK && WLK.release(); WLK = null; } catch (e) {} }

// عند العودة للصفحة يُعاد طلب قفل الشاشة إن كان التسجيل جارياً
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && RTI) wl(); });

// عند مغادرة الصفحة: إيقاف التسجيل والكاميرا والصوت وتحرير القفل
window.addEventListener("pagehide", () => {
  try { if (rec && rec.state !== "inactive") rec.stop(); } catch (e) {}
  try { cam && cam.getTracks().forEach(t => t.stop()); } catch (e) {}
  try { AC && AC.state !== "closed" && AC.close(); } catch (e) {}
  unwl();
});

// إظهار/إخفاء مؤشر REC وتحديث الوقت كل نصف ثانية
function recUI(on) {
  const el = $("recdot");
  if (!el) return;
  clearInterval(RTI); RTI = 0;
  if (on) {
    RT0 = performance.now();
    el.classList.remove("hid");
    RTI = setInterval(() => {
      const q = ((performance.now() - RT0) / 1000) | 0;
      $("rt").textContent = ((q / 60) | 0) + ":" + String(q % 60).padStart(2, "0");
    }, 500);
  } else el.classList.add("hid");
}

// تسخين ذاكرة الشعارات: نرسمها مسبقاً على دفعات صغيرة حتى لا يتقطع اللعب
function warm() {
  Object.keys(SPR).forEach(k => delete SPR[k]);
  const rs = [37, 38], n = ROWS.length * rs.length;
  let i = 0;
  (function step() {
    const t0 = performance.now();
    while (i < n && performance.now() - t0 < 5) {
      crest(ROWS[i % ROWS.length], -9999, -9999, rs[(i / ROWS.length) | 0]);
      i++;
    }
    if (i < n) setTimeout(step, 16);
  })();
}

/* ---------- 3) الترتيب (Leaderboard): محلي + خادم اختياري ---------- */
const API = "/api";   // ضع "" لتعطيل الخادم والاكتفاء بالتخزين المحلي

// معرّف ثابت للجهاز
function devId() {
  try {
    let i = localStorage.getItem("legend.dev");
    if (!i) { i = crypto.randomUUID(); localStorage.setItem("legend.dev", i); }
    return i;
  } catch (e) { return ""; }
}
// إرسال النتيجة للخادم (الفشل صامت)
async function remoteSubmit(e) {
  if (!API) return;
  try {
    await fetch(API + "/scores", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ n: e.n, av: e.av, p: e.p, t: e.t, id: devId() })
    });
  } catch (_) {}
}
// جلب أفضل 50 من الخادم
async function remoteTop() {
  if (!API) return null;
  const r = await fetch(API + "/scores?limit=50");
  return r.ok ? await r.json() : null;
}

// التخزين المحلي للنتائج
const LB = {
  k: "legend.scores.v1",
  load() { try { return JSON.parse(localStorage.getItem(this.k)) || { list: [] }; } catch (e) { return { list: [] }; } },
  save(d) { try { localStorage.setItem(this.k, JSON.stringify(d)); } catch (e) {} },

  // تسجيل نتيجة اللاعب (نحتفظ بأفضل نتيجة لكل اسم) وإرجاع ترتيبه
  submit(c) {
    const L = legacy(c), d = this.load(), key = S.name.trim().toLowerCase();
    let e = d.list.find(x => x.k == key);
    if (!e) { e = { k: key, n: S.name, av: AVSEL, p: 0, t: "", pl: 0, dt: 0 }; d.list.push(e); }
    e.pl++; e.n = S.name; e.av = AVSEL;
    if (L.p >= e.p) { e.p = L.p; e.t = L.t; e.dt = Date.now(); }
    this.save(d);
    const q = d.list.slice().sort((a, b) => b.p - a.p);
    remoteSubmit(e);
    return { pos: q.findIndex(x => x.k == key) + 1, n: q.length };
  },
  top() { return this.load().list.slice().sort((a, b) => b.p - a.p).slice(0, 50); }
};

// عرض شاشة الترتيب (الخادم أولاً ثم المحلي عند الفشل)
async function showLB() {
  const el = $("lb"), me = (S.name || $("nm").value).trim().toLowerCase();
  let rows = LB.top(), src = "على هذا الهاتف";
  try { const r = await remoteTop(); if (r && r.length) { rows = r; src = "الترتيب العام"; } } catch (e) {}

  el.innerHTML = '<h2>ترتيب الأساطير</h2><small></small><div class="lbl"></div><button class="btn" type="button" id="lbx">إغلاق</button>';
  el.querySelector("small").textContent = src;
  const L = el.querySelector(".lbl");
  if (!rows.length) L.textContent = "لا توجد نتائج بعد. أكمل مسيرتك لتظهر هنا.";

  rows.forEach((x, i) => {
    const r = document.createElement("div");
    r.className = "lbr" + ((x.k || String(x.n).toLowerCase()) == me ? " me" : "");   // تمييز صفّك
    const b = document.createElement("b");      b.textContent = i + 1;
    const m = document.createElement("span");   m.textContent = x.n;
    const t = document.createElement("em");     t.textContent = x.t || "";
    const p = document.createElement("strong"); p.textContent = x.p;
    r.append(b, avCanvas(x.av || 0, 40), m, t, p);
    L.appendChild(r);
  });
  $("lbx").onclick = () => el.classList.add("hid");
  el.classList.remove("hid");
}

/* ---------- 4) تدفق اللعبة ---------- */

// مناطق اللمس الشفافة فوق الـ canvas: زر لكل خيار ظاهر
function zones() {
  const r = layout(S.ph == "final" ? "final" : S.stage,
    S.stage == "club" ? 10 : S.stage == "focus" ? 8 : S.stage == "offers" ? S.offers.length : 1);
  const el = $("zones");
  el.innerHTML = "";
  if (S.picked != null || (S.ph != "play" && S.ph != "final")) return;   // لا أزرار أثناء الاختيار أو العدّ

  r.forEach((q, i) => {
    const b = document.createElement("button");
    b.style.cssText = `left:${q.x / W * 100}%;top:${q.y / H * 100}%;width:${q.w / W * 100}%;height:${q.h / H * 100}%`;
    b.setAttribute("aria-label", "خيار " + (i + 1));
    b.style.touchAction = "manipulation";
    b.onpointerdown = e => { e.preventDefault(); S.ph == "final" ? stop() : pick(i); };
    el.appendChild(b);
  });
}

// الانتقال إلى شاشة جديدة
function go(st) {
  S.stage = st;
  S.st = performance.now();
  S.picked = null;
  zones();
}

// اختيار المستخدم لخيار رقم i
function pick(i) {
  if (S.picked != null || S.ph != "play") return;

  // أزرار السابق/التالي في اختيار النادي: تغيير الصفحة فقط
  if (S.stage == "club" && i >= 8) {
    const max = Math.ceil(START.length / CLUB_PAGE_SIZE);
    clubPage = i == 8 ? (clubPage - 1 + max) % max : (clubPage + 1) % max;
    S.picked = null;
    S.st = performance.now() - 3000;     // نتجاوز حركة الدخول
    zones();
    return;
  }
  // شاشة الملخص: متابعة مباشرة
  if (S.stage == "chapter") { SFX.click(); return next(0); }

  S.picked = i;
  S.pa = performance.now();
  zones();
  try { navigator.vibrate && navigator.vibrate(12); } catch (e) {}   // اهتزاز خفيف
  const o = S.stage == "offers" ? S.offers[i] : null;
  SFX.click();
  if (o && o.kind == "move") setTimeout(SFX.cash, 120);              // صوت النقود عند الانتقال
  setTimeout(() => next(i), PICK);                                   // ننتظر انتهاء الوميض ثم نتقدم
}

// محاكاة فصل جديد وعرض ملخصه
function runCh(c) {
  const r = chapter(c);
  S.c = r.c; S.ch = r.ch; S.offers = r.o;
  go("chapter");
  SFX.swoosh();
  setTimeout(SFX.impact, 150);
  if (r.ch.t) setTimeout(() => SFX.roar(1.8), 500);                               // زئير عند الألقاب
  if (r.ch.ev.some(e => e.includes("🥇"))) setTimeout(SFX.whistle, 900);          // صافرة عند الكرة الذهبية
}

// معالجة الاختيار حسب المرحلة الحالية
function next(i) {
  if (S.stage == "chapter") {
    if (S.ch.end) fin(); else { go("offers"); SFX.riser(); }
    return;
  }
  if (S.stage == "club") {
    const chosen = START[clubPage * CLUB_PAGE_SIZE + i];
    if (!chosen) return;
    S.c = newC(S.name, S.pos, chosen.id);
    go("focus"); SFX.swoosh();
  } else if (S.stage == "focus") {
    S.c.focus = FOC[i][3];
    runCh(S.c);
  } else {
    // اختيار عرض: انتقال أو تجديد أو إعارة
    const o = S.offers[i], c = S.c, mv = o.k.id != c.cid;
    runCh({
      ...c,
      cid: o.k.id,
      yrs: o.kind == "loan" ? 1 : o.yrs,
      loan: o.kind == "loan" ? { cid: c.cid, yrs: Math.max(c.yrs, 2) } : c.loan,
      adapt: mv && o.k.cc != "MA" ? 1 : 0          // التأقلم مطلوب عند الانتقال خارج المغرب
    });
  }
}

// نهاية المسيرة: عرض البطاقة النهائية وحفظ النتيجة
function fin() {
  S.ph = "final";
  S.tf = performance.now();
  try { S.rank = LB.submit(S.c); } catch (e) {}
  zones();
  SFX.fanfare();
  setTimeout(SFX.whistle, 400);
}

/* ---------- 5) بدء اللعب والتسجيل ---------- */
function begin() {
  S.name = $("nm").value.trim() || "موهبة مغربية";
  try { localStorage.setItem("legend.me", JSON.stringify({ n: S.name, av: AVSEL })); } catch (e) {}
  $("dock").classList.add("hid");
  S.ph = "count";
  try { parent.postMessage({ legend: "play" }, location.origin); } catch (e) {}   // إشعار الصفحة المضيفة إن وُجدت
  if (!FAN) { wl(); recUI(1); }
  S.t0 = performance.now();
  if (AC) AC.resume();

  // التسجيل: فيديو الـ canvas + الصوت المدمج (ميكروفون + مؤثرات)
  if (window.MediaRecorder && !FAN) {
    const st = new MediaStream([...cv.captureStream(24).getVideoTracks(), ...dest.stream.getAudioTracks()]);
    const mt = ["video/mp4;codecs=avc1,mp4a.40.2", "video/webm;codecs=vp9,opus", "video/webm"].find(m => MediaRecorder.isTypeSupported(m));
    try {
      rec = new MediaRecorder(st, { mimeType: mt, videoBitsPerSecond: 2e6, audioBitsPerSecond: 96e3 });
      rec.ondataavailable = e => e.data.size && chunks.push(e.data);
      rec.onstop = () => {                       // عند الإيقاف: تجهيز الفيديو للمعاينة والتحميل
        const b = new Blob(chunks, { type: rec.mimeType }), u = URL.createObjectURL(b);
        $("rv").src = u;
        $("dl").href = u;
        $("dl").download = "career-legend." + (rec.mimeType.includes("mp4") ? "mp4" : "webm");
        $("res").style.display = "grid";
      };
      rec.start(1000);
    } catch (e) { rec = null; }
  }

  // أصوات العدّ ثم بدء اللعب بعد 3.55 ثانية
  for (let i = 0; i < 3; i++) setTimeout(SFX.tick, i * 1000);
  setTimeout(SFX.go, 3000);
  setTimeout(() => { S.ph = "play"; S.tp = performance.now(); go("club"); }, 3550);
}

// إنهاء الجلسة: إيقاف التسجيل (أو حفظ صورة في وضع المعجبين)
function stop() {
  if (S.ph == "done" || S.snap) return;

  if (FAN) {
    // وضع المعجبين: التقاط البطاقة كصورة PNG بعد انتهاء حركة الظهور
    S.snap = 1;
    $("zones").innerHTML = "";
    const wait = Math.max(0, 2300 - (performance.now() - S.tf));
    setTimeout(() => setTimeout(() => {
      cv.toBlob(b => {
        if (b) {
          const u = URL.createObjectURL(b);
          $("dl").href = u;
          $("dl").download = "career-legend.png";
          $("dl").textContent = "تنزيل بطاقة المسيرة (صورة)";
        } else $("dl").classList.add("hid");
        $("rv").classList.add("hid");
        $("res").style.display = "grid";
      }, "image/png");
      S.ph = "done";
      SFX.crowdOff();
    }, 150), wait);
    return;
  }

  S.ph = "done";
  zones();
  try { parent.postMessage({ legend: "end" }, location.origin); } catch (e) {}
  unwl(); recUI(0);
  if (rec && rec.state != "inactive") rec.stop(); else $("res").style.display = "grid";
  SFX.crowdOff();
}

/* ---------- 6) ربط واجهة البداية ---------- */

// أزرار اختيار المركز
$("ps").innerHTML = Object.keys(POSAR).map(k => `<button data-k="${k}" class="${k == "W" ? "on" : ""}">${POSAR[k]}</button>`).join("");
$("ps").onclick = e => {
  const k = e.target.dataset.k;
  if (!k) return;
  S.pos = k;
  [...$("ps").children].forEach(b => b.classList.toggle("on", b.dataset.k == k));
};

// الزر الرئيسي: أول نقرة تشغّل الكاميرا والميكروفون، والثانية تبدأ اللعب
$("go").onclick = async () => {
  const b = $("go");
  if (FAN) { if (!AC) sfxInit(null); begin(); return; }   // وضع المعجبين: بلا كاميرا
  if (cam) { begin(); return; }
  b.disabled = true;
  try {
    cam = await getCam();
    vid.srcObject = cam;
    await vid.play();
    // أبعد زووم ممكن ليظهر أكبر قدر من الصورة
    try {
      const tk = cam.getVideoTracks()[0], cp = tk.getCapabilities ? tk.getCapabilities() : {};
      if (cp.zoom) await tk.applyConstraints({ advanced: [{ zoom: cp.zoom.min }] });
    } catch (e) {}
    sfxInit(cam);
    b.textContent = "ابدأ التسجيل ●";
    $("ht").textContent = "اختر من أكثر من 80 نادياً، ثم اتخذ قراراتك الفنية والنفسية وعلّق بصوتك. التسجيل ينتهي تلقائياً ببطاقة الاعتزال.";
  } catch (e) {
    // رسائل خطأ واضحة حسب السبب
    const msg = e?.name === "NotAllowedError" ? "رفض المتصفح إذن الكاميرا أو الميكروفون. اسمح بالوصول من إعدادات الموقع ثم أعد المحاولة."
              : e?.name === "NotFoundError"   ? "لم يتم العثور على كاميرا أو ميكروفون متاح."
              : "تعذّر تشغيل الكاميرا. تأكد من إذن الموقع، وأغلق التطبيقات الأخرى التي تستخدم الكاميرا، ثم أعد المحاولة.";
    $("ht").textContent = msg;
    try { cam && cam.getTracks().forEach(t => t.stop()); } catch (_) {}
    cam = null;
  }
  b.disabled = false;
};

// نصوص وضع المعجبين
if (FAN) {
  $("go").textContent = "ابدأ اللعب";
  $("ht").textContent = "اختر من أكثر من 80 نادياً في دوريات متعددة، ثم ابنِ مسيرتك بقرارات فنية ونفسية من 17 إلى 38 سنة. لا حاجة للكاميرا ولا للميكروفون. في النهاية تحصل على بطاقة مسيرتك كصورة.";
}

// تحميل خط تجوال ثم مسح الذاكرة المؤقتة وإعادة تسخين الشعارات
if (document.fonts) {
  Promise.all(["500 30px Tajawal", "700 30px Tajawal", "800 30px Tajawal", "900 40px Tajawal"].map(f => document.fonts.load(f)))
    .then(() => { WM.clear(); lkey = ""; warm(); })
    .catch(() => 0);
}

// استرجاع الاسم والأفاتار المحفوظين وبناء شريط الأفاتار
(function () {
  let me = {};
  try { me = JSON.parse(localStorage.getItem("legend.me")) || {}; } catch (e) {}
  if (me.n) $("nm").value = me.n;
  AVSEL = me.av || 0;

  const box = $("avs");
  const sv = () => { try { localStorage.setItem("legend.me", JSON.stringify({ n: $("nm").value.trim(), av: AVSEL })); } catch (e) {} };

  AVS.forEach((_, i) => {
    const c = avCanvas(i, 44);
    c.setAttribute("role", "button");
    c.setAttribute("aria-label", "أفاتار " + (i + 1));
    if (i == AVSEL) c.classList.add("on");
    c.onclick = () => {
      AVSEL = i;
      [...box.children].forEach((x, j) => x.classList.toggle("on", j == i));
      sv();
    };
    box.appendChild(c);
  });
  $("lbb").onclick = showLB;
  $("nm").onchange = sv;
})();

/* ---------- 7) أداة تشخيص: افتح الصفحة بـ ?debug=1 لقياس الأداء ---------- */
const DBG = new URLSearchParams(location.search).get("debug") === "1";
let dbgEl, fc = [], gaps = [], lastT = 0;
if (DBG) {
  dbgEl = document.createElement("pre");
  dbgEl.style.cssText = "position:fixed;top:0;left:0;z-index:99;margin:0;padding:4px 6px;font:11px monospace;background:#000a;color:#0f0;pointer-events:none";
  document.body.appendChild(dbgEl);
}
// تجميع تكلفة الرسم وفجوات الإطارات، وعرض الملخص كل 60 إطاراً
function dbg(cost, n) {
  fc.push(cost);
  if (lastT) gaps.push(n - lastT);
  lastT = n;
  if (fc.length >= 60) {
    const s = fc.slice().sort((a, b) => a - b);
    const cs = cam ? cam.getVideoTracks()[0].getSettings() : {};
    dbgEl.textContent =
      `draw avg ${(fc.reduce((a, b) => a + b) / fc.length).toFixed(1)}ms p95 ${s[Math.floor(s.length * .95)].toFixed(1)} max ${s[s.length - 1].toFixed(1)}\n` +
      `frame gaps >50ms: ${gaps.filter(x => x > 50).length}/${gaps.length}\n` +
      `cam ${cs.width}x${cs.height}@${Math.round(cs.frameRate || 0)} rec:${rec ? rec.state : "-"}`;
    fc = []; gaps = [];
  }
}

/* ---------- 8) حلقة الرسم: حوالي 25 إطاراً في الثانية ---------- */
let lastF = 0;
(function loop(n) {
  requestAnimationFrame(loop);
  if (n - lastF < 40) return;      // تخطي الإطارات الأسرع من 40ms (≈25fps) لتوفير الطاقة
  lastF = n;
  const t0 = performance.now();
  frame(n);
  if (DBG) dbg(performance.now() - t0, n);
})(performance.now());
