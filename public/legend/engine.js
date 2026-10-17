"use strict";
/* ==========================================================
   engine.js — محرك مسيرة اللاعب (بدون أي رسم أو صوت)
   يعتمد على data.js: ROWS, CL, START, BIG
   ========================================================== */

/* ---------- 1) دوال مساعدة عامة ---------- */
const R   = (a, b) => a + Math.random() * (b - a);              // رقم عشوائي بين a و b
const cl  = (x, a, b) => Math.max(a, Math.min(b, x));            // حصر القيمة بين حدّين
const pk  = a => a[Math.random() * a.length | 0];                // اختيار عنصر عشوائي من مصفوفة
const pr  = p => Math.random() < p;                              // يعيد true باحتمال p
const c01 = x => cl(x, 0, 1);                                    // حصر بين 0 و 1

// توزيع بواسون: عدد الأحداث (أهداف مثلاً) بمتوسط l
const poi = l => {
  const L = Math.exp(-l);
  let k = 0, p = 1;
  do { k++; p *= Math.random(); } while (p > L);
  return k - 1;
};

// منحنيات حركة (Easing) تُستعمل لاحقاً في الرسوم
const eob = x => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }; // ارتداد
const eoc = x => 1 - Math.pow(1 - x, 3);                                                                    // تباطؤ ناعم

/* ---------- 2) ثوابت اللعبة ---------- */
const POS   = { FW: "مهاجم", W: "جناح", MF: "لاعب وسط", DF: "مدافع" };
const POSAR = { FW: "مهاجم", W: "جناح", MF: "وسط",      DF: "مدافع" };
const END   = 38;   // سن الاعتزال النهائي

// ترجمة نتائج البطولات الدولية
const TRA = {
  "WINNER": "بطل", "RUNNER-UP": "وصيف", "SEMI-FINAL": "نصف النهائي",
  "QUARTER-FINAL": "ربع النهائي", "EARLY EXIT": "خروج مبكر"
};

/* ---------- 3) القيمة السوقية، الدور، الراتب ---------- */

// القيمة السوقية (مليون يورو): ترتفع أُسّياً مع التقييم، وتتأثر بالعمر والسمعة
const val = (o, a, r) => Math.max(.1, Math.round(
  20 * Math.exp(.11 * (o - 70))
  * (a <= 21 ? 1.3 : a <= 27 ? 1 : Math.max(.15, 1 - (a - 27) * .13))
  * (1 + r / 200) * 10) / 10);

// دور اللاعب في النادي حسب فارق تقييمه عن قوة النادي، مع نسبة المشاركة المتوقعة
const role = (o, c) => {
  const d = o - c.s;
  return d >= 3   ? ["نجم الفريق", .92]
       : d >= -2  ? ["لاعب أساسي", .78]
       : d >= -6  ? ["بديل متناوب", .55]
       : d >= -11 ? ["احتياطي", .3]
       :            ["مهمَّش", .12];
};

// الراتب السنوي: نسبة من القيمة السوقية مضروبة في ثراء النادي
const wage = (c, k) => Math.max(.05, Math.round(val(c.ovr, c.age, c.rep) * .07 * k.rich * 100) / 100);

/* ---------- 4) إنشاء لاعب جديد ---------- */
const newC = (name, pos, cid) => {
  const o = Math.round(R(57, 64));   // التقييم الابتدائي
  return {
    name, pos, age: 17, ovr: o,
    pot: Math.round(74 + 20 * Math.pow(Math.random(), 1.6)),   // السقف المحتمل (الموهبة)
    cid,                       // معرّف النادي الحالي
    focus: "train",            // العقلية المختارة
    yrs: 3,                    // سنوات العقد المتبقية
    rep: 5,                    // السمعة
    adapt: 0,                  // علامة التأقلم بعد الانتقال
    cap: 0,                    // هل هو قائد الفريق
    morale: 68, confidence: 58, pressure: 28,
    chemistry: 55, tactics: 50, professionalism: 58, injuryRisk: 0,
    peak: o,                   // أعلى تقييم وصل إليه
    pv: val(o, 17, 5),         // أعلى قيمة سوقية
    caps: 0,                   // مباريات المنتخب
    lg: 0, ct: 0, af: 0, wc: 0, bo: 0, gb: 0, poty: 0,   // الألقاب والجوائز
    log: []                    // سجل المواسم
  };
};

// نتيجة عشوائية في بطولة دولية، w = احتمال الفوز باللقب
const tr = w => {
  const r = Math.random();
  return r < w        ? "WINNER"
       : r < w + .08  ? "RUNNER-UP"
       : r < w + .18  ? "SEMI-FINAL"
       : r < w + .38  ? "QUARTER-FINAL"
       :                "EARLY EXIT";
};

/* ---------- 5) محاكاة موسم واحد ---------- */
function sim(p) {
  const c = { ...p, log: [...p.log] };     // نسخة جديدة حتى لا نعدّل الأصل
  const k = CL[c.cid];                     // النادي الحالي
  const ev = [];                           // أحداث الموسم
  const [rl, mn] = role(c.ovr, k);

  // نسبة المشاركة (m) تتأثر بالدور والعقلية
  let m = cl(mn + R(-.1, .1)
           + (c.focus == "push" ? .05 : 0)
           + (c.focus == "home" && k.cc == "MA" ? .05 : 0), .05, .97);
  let gp = 0;   // خسارة تقييم بسبب الإصابة

  // --- أحداث سلبية عشوائية ---
  if (c.adapt) {
    m *= c.focus == "abroad" ? .96 : .9;
    ev.push("🌱 فترة تأقلم مع النادي الجديد");
  }
  if (pr(.03)) {
    m *= .3; gp = 3; ev.push("🤕 إصابة خطيرة في الركبة");
  } else if (pr(.1 + (c.age > 30 ? .08 : 0) + (c.focus == "rest" ? -.06 : c.focus == "push" ? .03 : 0))) {
    m *= .6; gp = 1; ev.push("🤕 إصابة تبعده لأسابيع");
  }
  if (pr(.06)) { m *= .92; ev.push("🟥 بطاقة حمراء في الديربي"); }
  if (pr(.03)) { m *= .7;  ev.push("🏥 ظروف شخصية أبعدته عن الملاعب"); }
  if (pr(.04)) { m *= .85; c.rep = cl(c.rep - 2, 0, 100); ev.push("💥 خلاف داخل غرفة الملابس"); }

  // --- تطور التقييم (d) ---
  let d;
  if (c.age <= 27) {
    // مرحلة النمو: يقترب من السقف المحتمل حسب العمر والمشاركة وقوة النادي
    const r = c.age <= 19 ? .3 : c.age <= 22 ? .28 : c.age <= 25 ? .22 : .15;
    d = (c.pot - c.ovr) * r * (.3 + m) * (.85 + k.s / 400) + R(-1, 1);
    if (c.ovr > k.s + 8) d *= .4;                       // تباطؤ إذا تجاوز مستوى ناديه كثيراً
    if (pr(.06)) { d += 2.5; ev.push("🔥 موسم انفجاري!"); }
  } else {
    // مرحلة التراجع بعد 27
    d = c.age <= 30 ? -.5 + R(-1, 1)
      : c.age <= 33 ? -1.2 + R(-1, .8)
      :               -2 + R(-1, .6);
  }

  // --- تأثير العقلية المختارة على التطور ---
  if (c.focus == "train"  && c.age <= 25) d += .95;
  if (c.focus == "rest"   && c.age <= 30) d += .15;
  if (c.focus == "home")                  d -= .15;
  if (c.focus == "tactics" && c.age >= 20) d += .25;
  if (c.focus == "team")                  d += .1;
  if (c.focus == "abroad" && c.adapt)     d -= .2;
  if (c.age > 27 && pr(.04)) { d -= 2; ev.push("📉 تراجع مفاجئ في المستوى"); }

  // تطبيق التغيير (الحد الأعلى = السقف المحتمل قبل 27)
  c.ovr = cl(Math.round(c.ovr + d - gp), 40, c.age <= 27 ? c.pot : 99);

  // --- إحصائيات الموسم: مباريات، أهداف، تمريرات، تقييم أداء ---
  const ap = Math.round(k.games * m);                                                    // المباريات
  const sk = cl(.5 + (c.ovr - 55) / 30, .3, 1.8) * cl(1 + (c.ovr - k.s) / 50, .6, 1.4);  // معامل المهارة
  const G = { FW: .45, W: .3, MF: .14, DF: .04 }[c.pos];                                 // معدل التهديف حسب المركز
  const A = { FW: .14, W: .25, MF: .2, DF: .07 }[c.pos];                                 // معدل التمرير
  const go = poi(ap * G * sk);
  const as = poi(ap * A * sk);
  const pf = cl(6 + (c.ovr - k.s) * .08 + (go + as) / Math.max(ap, 1) * 2 + R(-.6, .6), 4, 9.9);  // متوسط تقييم الأداء
  if (c.age < 25 && pf >= 8 && c.pot < 99) c.pot++;                                      // أداء رائع يرفع السقف

  // --- الألقاب ---
  let t = 0, cw = 0, ww = 0;   // t عدد الألقاب، cw لقب قاري، ww كأس العالم
  const part = ap / Math.max(1, k.games * .72);
  const titleChance = cl(k.pL * (.62 + Math.max(0, c.ovr - k.s) * .035) * cl(part, .25, 1), .003, .72);
  const continentalChance = cl(k.pC * (.58 + Math.max(0, c.ovr - k.s) * .025) * cl(ap / Math.max(1, k.games * .72), .2, 1), .002, .48);
  if (ap >= 8 && pr(titleChance))       { c.lg++; t++; ev.push("🏆 بطل " + k.league); }
  if (ap >= 8 && pr(continentalChance)) { c.ct++; t++; cw = 1; ev.push("🏆 بطل قاري"); }

  // --- المنتخب الوطني: كأس إفريقيا (سنوات زوجية) وكأس العالم (كل 4 سنوات) ---
  const yr = 2026 + c.age - 17;
  if ((c.ovr >= 72 && c.age >= 19 && m >= .4) || c.ovr >= 78) {
    if (!p.caps) ev.push("🇲🇦 أول استدعاء للمنتخب");
    c.caps += Math.round(R(4, 10)) + (c.focus == "home" ? 3 : 0);
    if (pr(.03)) { m *= .85; ev.push("🤕 أصيب خلال معسكر المنتخب"); }

    if (yr % 2 == 0) {
      const r = tr(.05 + Math.max(0, c.ovr - 78) * .006);
      ev.push(r == "WINNER" ? "🏆 بطل كأس أمم إفريقيا" : "كأس أمم إفريقيا: " + TRA[r]);
      if (r == "WINNER") { c.af++; t++; }
    }
    if (yr % 4 == 1) {
      const r = tr(.015 + Math.max(0, c.ovr - 80) * .004);
      ev.push(r == "WINNER" ? "🏆 بطل كأس العالم" : "كأس العالم: " + TRA[r]);
      if (r == "WINNER") { c.wc++; t++; ww = 1; }
    }
  }

  // --- الجوائز الفردية ---
  if (c.ovr >= 87 && ap >= 25 && k.w >= .85 &&
      pr(cl(((c.ovr - 86) * .05 + (cw ? .25 : 0) + (ww ? .3 : 0) + (t ? .06 : 0) + (go >= 25 ? .08 : 0))
            * (c.focus == "mind" ? 1.25 : 1), 0, .85) * .4)) {
    c.bo++; ev.push("🥇 فاز بالكرة الذهبية");
  }
  if (go >= 26 && pr((go - 24) * .12)) { c.gb++;   ev.push("👟 فاز بالحذاء الذهبي"); }
  if (pf >= 8.3 && pr(.5))             { c.poty++; ev.push("⭐ أفضل لاعب في الدوري"); }
  if (ap >= 8 && pr(k.pL * .8))        { c.lg++; t++; ev.push("🏆 بطل الكأس المحلية"); }

  // --- أحداث السمعة والإعلام ---
  if (c.age <= 21 && pf >= 7.5 && pr(.3)) { c.rep += 3; ev.push("🏅 أفضل لاعب شاب في الدوري"); }
  if (go >= 6 && pr(.1))                  { c.rep++;    ev.push("🎯 هدف الموسم"); }

  // عودة قوية بعد موسم فيه إصابة
  if (p.log.length && p.log[p.log.length - 1].ev.some(e => e.includes("🤕")) && pf >= 7.5) {
    c.ovr = Math.min(c.ovr + 1, 99); ev.push("🩹 عودة قوية بعد الإصابة");
  }
  if (c.rep >= 50 && pr(.1))                 { c.rep += 2; ev.push("📺 عقد إعلانات ضخم"); }
  if (k.pC > .05 && !cw && pr(.25))          { c.rep++;    ev.push("🌍 بلغ نصف النهائي القاري"); }
  if (go >= 10 && pr(.25)) ev.push("🎩 هاتريك في مباراة كبيرة");
  if (!c.cap && c.age >= 25 && rl == "نجم الفريق" && pr(.25)) { c.cap = 1; c.rep += 3; ev.push("👑 أصبح قائد الفريق"); }
  if (pr(.07)) { c.rep++; ev.push("📰 رُبط اسمه بالانتقال إلى " + pk(BIG).ar); }
  if (c.age <= 21 && c.ovr >= c.pot - 5 && pr(.15)) { c.rep += 4; ev.push("⭐ ضجة حول الموهبة الصاعدة"); }
  if (c.age >= 33 && pr(.15)) ev.push("📰 تكهنات حول الاعتزال");

  // --- الحالة النفسية: الثقة والمعنويات حسب الأداء ---
  if (pf >= 7.4)      { c.confidence = cl(c.confidence + 5, 0, 100); c.morale = cl(c.morale + 4, 0, 100); }
  else if (pf < 6.1)  { c.confidence = cl(c.confidence - 5, 0, 100); c.morale = cl(c.morale - 4, 0, 100); }

  // --- أثر العقلية على الضغط والانسجام والاحتراف ---
  if (c.focus == "mind")        { c.pressure = cl(c.pressure - 12, 0, 100); c.confidence = cl(c.confidence + 4, 0, 100); }
  else if (c.focus == "push")   { c.pressure = cl(c.pressure + 7, 0, 100);  c.morale = cl(c.morale - 1, 0, 100); }
  else if (c.focus == "rest")   { c.pressure = cl(c.pressure - 8, 0, 100);  c.morale = cl(c.morale + 5, 0, 100); }
  else if (c.focus == "team")   { c.chemistry = cl(c.chemistry + 8, 0, 100); c.morale = cl(c.morale + 3, 0, 100); }
  else if (c.focus == "tactics"){ c.tactics = cl(c.tactics + 8, 0, 100); }
  else if (c.focus == "train")  { c.professionalism = cl(c.professionalism + 5, 0, 100); c.injuryRisk = cl(c.injuryRisk + 3, 0, 100); }

  // --- تحديث السمعة النهائية والقمم ---
  c.rep = cl(Math.round(c.rep
        + (c.focus == "push" ? 2 : c.focus == "mind" ? 3 : c.focus == "team" ? 2 : c.focus == "tactics" ? 1 : 0)
        + (pf - 6.5) * 4 * (.4 + k.w) + t * 3 - (c.age > 31 ? 1.5 : 0)), 0, 100);
  c.peak = Math.max(c.peak, c.ovr);
  c.pv   = Math.max(c.pv, val(c.ovr, c.age, c.rep));
  c.adapt = 0;

  // --- حفظ الموسم في السجل وتقدّم العمر ---
  c.log.push({ age: c.age, yr, cid: k.id, ovr: c.ovr, ap, go, as, t, ev });
  c.age++;
  c.yrs--;

  // انتهاء الإعارة: العودة للنادي الأصلي
  if (c.loan && c.yrs <= 0) {
    c.cid = c.loan.cid; c.yrs = c.loan.yrs; c.loan = null;
    c.log[c.log.length - 1].ev.push("↩️ عاد إلى ناديه بعد الإعارة");
  }
  return c;
}

/* ---------- 6) عروض الانتقال والتجديد والإعارة ---------- */
function offers(c) {
  if (c.age > END) return [];
  const ex = c.yrs <= 0;   // هل انتهى العقد؟
  // إن لم ينتهِ العقد: عروض بشكل عشوائي فقط بين 18 و35 سنة
  if (!ex && !(c.age >= 18 && c.age <= 35 && pr(.45))) return [];

  const cur = CL[c.cid];
  // أقصى مستوى أندية يمكن أن تهتم به (يرتفع مع السمعة والاحتراف بالخارج)
  const reach = c.ovr + 6 + c.rep * .12 + (c.focus == "abroad" ? 5 : c.focus == "home" ? -3 : 0);

  // الأندية المؤهلة: مستوى مناسب، والدوريات السعودية والأمريكية بعد سن 29 فقط
  const el = ROWS.filter(x =>
      x.id != cur.id && x.s <= reach && x.s >= c.ovr - 14 &&
      (!["SA", "US"].includes(x.cc) || c.age >= 29) &&
      (pr(.35 + c.rep / 200 + (c.focus == "abroad" && x.cc != "MA" ? .25 : 0)) || x.cc == "MA"))
    .sort((a, b) => b.s - a.s);

  // اختيار حتى 3 أندية: الأقوى أولاً (إن كان أقوى من ناديه) ثم عشوائياً
  const ch = [];
  if (el[0] && el[0].s > cur.s) ch.push(el[0]);
  for (const x of el.slice(1).sort(() => Math.random() - .5)) {
    if (ch.length >= 3) break;
    ch.push(x);
  }

  // تحويل الأندية إلى عروض
  const o = ch.map(k => ({
    kind: "move", k,
    yrs: c.age >= 31 ? 2 : pk([3, 4, 5]),
    w: wage(c, k),
    role: role(c.ovr, k)[0]
  }));

  // هل مستواه أقل بكثير من ناديه؟ (لن يُعرض عليه التجديد عند انتهاء العقد)
  const dr = c.ovr - cur.s < -12 && c.age > 20;
  if (!(ex && dr)) {
    o.unshift({ kind: "renew", k: cur, yrs: c.age >= 33 ? 1 : pk([2, 3, 4]), w: wage(c, cur), role: role(c.ovr, cur)[0] });
  } else if (!o.length) {
    // لا عروض إطلاقاً: نادٍ بمستواه تقريباً كحل أخير
    const f = START.slice().sort((a, b) => Math.abs(a.s - c.ovr) - Math.abs(b.s - c.ovr))[0];
    o.push({ kind: "move", k: f, yrs: 2, w: wage(c, f), role: role(c.ovr, f)[0] });
  }

  // عرض إعارة للشباب غير الأساسيين (حتى 24 سنة)
  if (c.age <= 24 && !c.loan && ["بديل متناوب", "احتياطي", "مهمَّش"].includes(role(c.ovr, cur)[0])) {
    const L = ROWS.filter(x => x.id != cur.id && x.s < cur.s && x.s >= c.ovr - 6 && x.s <= c.ovr + 3);
    if (L.length) {
      const k = pk(L);
      o.push({ kind: "loan", k, yrs: 1, w: wage(c, k) * .6, role: role(c.ovr, k)[0] });
    }
  }
  return o.length > 1 || ex ? o : [];
}

/* ---------- 7) فصل كامل: مواسم متتالية حتى ظهور عروض أو الاعتزال ---------- */
function chapter(s) {
  let c = s, o = [];
  const f = c.log.length;                       // عدد المواسم قبل هذا الفصل
  do { c = sim(c); o = offers(c); } while (!o.length && c.age <= END);

  const L = c.log.slice(f);                     // مواسم هذا الفصل فقط
  const sm = x => L.reduce((a, l) => a + l[x], 0);   // مجموع إحصائية معينة
  const end = c.age > END;

  // دمج الأحداث وإظهار الألقاب أولاً
  let ev = L.flatMap(l => l.ev.filter(e => !e.startsWith("🌱")).map(e => l.age + ": " + e));
  ev.sort((a, b) => /🏆|🥇|👟/.test(b) - /🏆|🥇|👟/.test(a));
  if (end) ev.push("99: 🎽 يعلّق حذاءه ويعتزل");

  return {
    c,
    o: end ? [] : o,
    ch: {
      a: L[0].age, b: L[L.length - 1].age, cid: L[L.length - 1].cid,
      o0: f ? s.log[f - 1].ovr : s.ovr, o1: c.ovr,
      ap: sm("ap"), go: sm("go"), as: sm("as"), t: sm("t"),
      ev, end
    }
  };
}

/* ---------- 8) نقاط الإرث وتصنيف اللاعب النهائي ---------- */
function legacy(c) {
  const go = c.log.reduce((a, l) => a + l.go, 0);
  const p = (c.peak - 60) * 1.2 + c.lg * 3 + c.ct * 8 + c.af * 18 + c.wc * 45
          + c.bo * 40 + c.gb * 8 + c.poty * 4 + go / 15 + c.caps / 10;
  return {
    p: Math.round(p),
    t: p >= 190 || c.bo || c.wc ? "أسطورة عالمية"
     : p >= 130 ? "أسطورة إفريقية"
     : p >= 75  ? "نجم كبير"
     : p >= 40  ? "لاعب محترف ناجح"
     :            "موهبة ضائعة"
  };
}
