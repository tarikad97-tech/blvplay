"use strict";
/* ==========================================================
   audio.js — المؤثرات الصوتية (تركيب صوتي بدون ملفات خارجية)
   تُمزج المؤثرات مع صوت الميكروفون وتُسجَّل داخل الفيديو
   ========================================================== */

/* ---------- 1) متغيرات الصوت العامة ---------- */
let AC;        // سياق الصوت AudioContext
let dest;      // مخرج التسجيل (يُدمج مع الفيديو)
let bus;       // القناة الرئيسية التي تمر بها كل المؤثرات
let wet;       // قناة الصدى (Reverb)
let crowdG;    // مستوى صوت الجمهور في الخلفية
let NB;        // مخزن ضجيج أبيض جاهز لاستعماله في المؤثرات
let ready = 0; // هل تم تهيئة الصوت؟

/* ---------- 2) تهيئة نظام الصوت ----------
   mic: بث الميكروفون (يكون null في وضع المعجبين بلا كاميرا) */
function sfxInit(mic) {
  AC = new AudioContext();
  dest = AC.createMediaStreamDestination();

  // ضاغط (Compressor) يمنع تشويه الصوت عند ارتفاع المؤثرات
  const cp = AC.createDynamicsCompressor();
  cp.threshold.value = -18;
  cp.ratio.value = 5;

  // القناة الرئيسية → الضاغط → التسجيل + مكبرات الجهاز
  bus = AC.createGain();
  bus.gain.value = .9;
  bus.connect(cp);
  cp.connect(dest);
  cp.connect(AC.destination);

  // صدى صناعي: نبني استجابة نبضية من ضجيج يتلاشى تدريجياً (طولها 1.1 ثانية)
  const ir = AC.createBuffer(2, AC.sampleRate * 1.1, AC.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.6);
  }
  const conv = AC.createConvolver();
  conv.buffer = ir;
  wet = AC.createGain();
  wet.gain.value = .35;
  wet.connect(conv);
  conv.connect(bus);

  // ربط الميكروفون بالتسجيل فقط (لا نسمعه في المكبر لتفادي الصدى)
  if (mic && mic.getAudioTracks().length) AC.createMediaStreamSource(mic).connect(dest);

  // ضجيج أبيض مدته 3 ثوانٍ يُقتطع منه جزء عشوائي في كل مؤثر
  NB = AC.createBuffer(1, AC.sampleRate * 3, AC.sampleRate);
  const d = NB.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

  ready = 1;
}

/* ---------- 3) توصيل أي عقدة صوتية بالقناة الرئيسية وبالصدى ----------
   n: العقدة، v: مستوى الصوت، wv: نسبة الصدى */
const out = (n, v, wv = .25) => {
  const gain = AC.createGain();
  gain.gain.value = v;
  n.connect(gain);
  gain.connect(bus);
  const wetGain = AC.createGain();
  wetGain.gain.value = wv;
  gain.connect(wetGain);
  wetGain.connect(wet);
};

/* ---------- 4) نغمة موسيقية واحدة ----------
   f: التردد، d: المدة، ty: شكل الموجة، v: الارتفاع، at: التأخير،
   to: تردد النهاية (انزلاق)، wv: الصدى، lp: مرشح يقطع الترددات العالية */
function tone(f, d, ty = "sine", v = .4, at = 0, to = 0, wv = .25, lp = 0) {
  if (!ready) return;
  const t = AC.currentTime + at;
  const osc = AC.createOscillator();
  const env = AC.createGain();       // غلاف الصوت: بداية سريعة ثم تلاشٍ

  osc.type = ty;
  osc.frequency.setValueAtTime(f, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + d);

  env.gain.setValueAtTime(.0001, t);
  env.gain.exponentialRampToValueAtTime(v, t + Math.min(.03, d / 3));
  env.gain.exponentialRampToValueAtTime(.0001, t + d);

  let node = osc;
  if (lp) {
    const filter = AC.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = lp;
    osc.connect(filter);
    node = filter;
  }
  node.connect(env);
  out(env, 1, wv);
  osc.start(t);
  osc.stop(t + d + .05);
}

/* ---------- 5) ضجيج مفلتر (همسة، هبّة، زئير...) ----------
   f0 → f1: تردد المرشح من البداية للنهاية، q: حدّة المرشح،
   swell: متى يبلغ الصوت ذروته (نسبة من المدة) */
function noise(d, f0, f1, v = .4, at = 0, q = 1, ty = "bandpass", swell = .4) {
  if (!ready) return;
  const t = AC.currentTime + at;
  const src = AC.createBufferSource();
  src.buffer = NB;

  const filter = AC.createBiquadFilter();
  filter.type = ty;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(f0, t);
  filter.frequency.exponentialRampToValueAtTime(f1, t + d);

  const env = AC.createGain();
  env.gain.setValueAtTime(.0001, t);
  env.gain.exponentialRampToValueAtTime(v, t + d * swell);
  env.gain.exponentialRampToValueAtTime(.0001, t + d);

  src.connect(filter);
  filter.connect(env);
  out(env, 1, .3);
  src.start(t, Math.random() * (NB.duration - d - .1), d);   // جزء عشوائي من الضجيج
}

/* ---------- 6) مكتبة المؤثرات الجاهزة ---------- */
const SFX = {

  // نقرة خفيفة عند اختيار زر
  click() {
    tone(950, .07, "sine", .5, 0, 300, .05);
    noise(.04, 5000, 3000, .2, 0, 1, "highpass", .2);
  },

  // دقة العدّ التنازلي (3، 2، 1)
  tick() {
    tone(110, .35, "sine", .7, 0, 55, .2);
    tone(880, .22, "sine", .35, 0, 0, .35);
    tone(1320, .14, "triangle", .14, .01, 0, .35);
    noise(.05, 5000, 3000, .15, 0, 1, "highpass", .2);
  },

  // لحظة الانطلاق بعد العدّ
  go() {
    tone(523, .8, "sawtooth", .14, 0, 0, .45, 2200);
    tone(784, .8, "sawtooth", .13, 0, 0, .45, 2200);
    tone(1047, .9, "sawtooth", .12, .02, 0, .5, 2400);
    tone(65, .7, "sine", .8, 0, 40, .3);
    noise(.5, 500, 6000, .4, 0, 2, "bandpass", .3);
  },

  // انتقال سريع بين الشاشات
  swoosh() {
    noise(.55, 300, 5000, .55, 0, 2);
    tone(180, .4, "sine", .25, 0, 60, .3);
  },

  // ضربة قوية عند ظهور ملخص الفصل
  impact() {
    tone(130, .6, "sine", .8, 0, 38, .4);
    noise(.3, 3000, 200, .5, 0, .7, "lowpass", .05);
  },

  // صوت تصاعدي يسبق ظهور العروض
  riser() {
    tone(160, .9, "sawtooth", .1, 0, 1400, .5, 1800);
    noise(.9, 400, 6000, .35, 0, 3, "bandpass", .9);
  },

  // صوت صندوق نقود عند قبول الانتقال
  cash() {
    [1760, 2349, 3136].forEach((f, i) => {
      tone(f, .7, "sine", .28 / (i + 1), i * .04, 0, .4);
      tone(f * 2.76, .35, "sine", .08, i * .04, 0, .4);
    });
    noise(.06, 6000, 9000, .2, 0, 2);
  },

  // صافرة الحكم: صفرتان قصيرتان وطويلة
  whistle() {
    [[0, .16], [.22, .16], [.44, .5]].forEach(([start, dur]) => {
      if (!ready) return;
      const t = AC.currentTime + start;
      const osc = AC.createOscillator();    // الصوت الأساسي
      const lfo = AC.createOscillator();    // اهتزاز سريع يعطي طابع الصافرة
      const lfoGain = AC.createGain();
      const env = AC.createGain();

      osc.type = "sine";
      osc.frequency.value = 2850;
      lfo.frequency.value = 30;
      lfoGain.gain.value = 90;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      env.gain.setValueAtTime(.0001, t);
      env.gain.exponentialRampToValueAtTime(.3, t + .02);
      env.gain.setValueAtTime(.3, t + dur - .04);
      env.gain.exponentialRampToValueAtTime(.0001, t + dur);

      osc.connect(env);
      out(env, 1, .35);
      osc.start(t); lfo.start(t);
      osc.stop(t + dur + .05); lfo.stop(t + dur + .05);
    });
    noise(.8, 2600, 3200, .08, 0, 6);   // نفَس الحكم
  },

  // زئير الجمهور (d = المدة بالثواني)
  roar(d = 2) {
    noise(d, 500, 1400, .7, 0, .6, "bandpass", .35);
    noise(d, 900, 2200, .35, .1, .8, "bandpass", .4);
  },

  // فانفار النهاية: أربع نغمات ثم زئير الجمهور
  fanfare() {
    [[523, 0], [659, 0], [784, 0], [1047, .28]].forEach(([f, at]) => {
      tone(f, .9, "sawtooth", .16, at, 0, .45, 1900);
      tone(f / 2, .9, "triangle", .14, at);
    });
    SFX.roar(2.4);
  },

  // أجواء الجمهور في الخلفية (تعمل في حلقة مستمرة)
  crowd() {
    if (!ready || crowdG) return;           // لا تُشغَّل مرتين

    // ضجيج أبيض مدته 4 ثوانٍ في حلقة
    const buf = AC.createBuffer(1, AC.sampleRate * 4, AC.sampleRate);
    const a = buf.getChannelData(0);
    for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1;
    const src = AC.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const filter = AC.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 700;
    filter.Q.value = .5;

    crowdG = AC.createGain();
    crowdG.gain.value = .05;

    // اهتزاز بطيء في المستوى يحاكي تموّج هتاف الجمهور
    const lfo = AC.createOscillator();
    const lfoGain = AC.createGain();
    lfo.frequency.value = .25;
    lfoGain.gain.value = .025;
    lfo.connect(lfoGain);
    lfoGain.connect(crowdG.gain);

    src.connect(filter);
    filter.connect(crowdG);
    out(crowdG, 1, .15);
    src.start();
    lfo.start();
  },

  // إسكات صوت الجمهور
  crowdOff() {
    if (crowdG) crowdG.gain.value = 0;
  }
};
