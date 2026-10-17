"use strict";
/* ==========================================================
   data.js — بيانات الدول والأندية (قوة الأندية وألوانها تقريبية وقابلة للتعديل)
   يُحمَّل قبل engine.js، لذلك لا يستعمل دوال المحرك (مثل cl)
   ========================================================== */

/* ---------- 1) الدول والدوريات ----------
   الصيغة: كود الدولة: [علم، اسم الدولة، وزن الدوري (يؤثر في الكرة الذهبية)، اسم الدوري، عدد مباريات الموسم] */
const CC = {
  MA: ["🇲🇦", "المغرب",              .5,  "البطولة الاحترافية", 30],
  EG: ["🇪🇬", "مصر",                 .55, "الدوري المصري",      34],
  ZA: ["🇿🇦", "جنوب إفريقيا",        .5,  "الدوري الجنوب إفريقي", 30],
  TN: ["🇹🇳", "تونس",                .45, "الدوري التونسي",     30],
  CD: ["🇨🇩", "الكونغو الديمقراطية", .4,  "الدوري الكونغولي",   30],
  GB: ["🇬🇧", "إنجلترا",             1,   "الدوري الإنجليزي",   38],
  SC: ["🏴",  "اسكتلندا",            .5,  "الدوري الاسكتلندي",  34],
  ES: ["🇪🇸", "إسبانيا",             .95, "الدوري الإسباني",    38],
  DE: ["🇩🇪", "ألمانيا",             .9,  "الدوري الألماني",    34],
  IT: ["🇮🇹", "إيطاليا",             .9,  "الدوري الإيطالي",    38],
  FR: ["🇫🇷", "فرنسا",               .85, "الدوري الفرنسي",     34],
  PT: ["🇵🇹", "البرتغال",            .75, "الدوري البرتغالي",   34],
  NL: ["🇳🇱", "هولندا",              .75, "الدوري الهولندي",    34],
  TR: ["🇹🇷", "تركيا",               .65, "الدوري التركي",      34],
  BE: ["🇧🇪", "بلجيكا",              .65, "الدوري البلجيكي",    34],
  SA: ["🇸🇦", "السعودية",            .75, "الدوري السعودي",     34],
  US: ["🇺🇸", "أمريكا",              .55, "الدوري الأمريكي",    34],
  BR: ["🇧🇷", "البرازيل",            .65, "الدوري البرازيلي",   38]
};

/* ---------- 2) الأسماء العربية للأندية (المفتاح = معرّف النادي) ---------- */
const AR = {
  // المغرب
  raja: "الرجاء الرياضي", wydad: "الوداد الرياضي", far: "الجيش الملكي", berkane: "نهضة بركان",
  mas: "المغرب الفاسي", fus: "الفتح الرياضي", husa: "حسنية أكادير", safi: "أولمبيك آسفي",
  tanger: "اتحاد طنجة", dhj: "الدفاع الحسني الجديدي",
  // إفريقيا
  ahly: "الأهلي المصري", zamalek: "الزمالك", pyramids: "بيراميدز", sundowns: "صن داونز",
  esperance: "الترجي التونسي", mazembe: "مازيمبي",
  // إنجلترا
  mancity: "مانشستر سيتي", liverpool: "ليفربول", arsenal: "آرسنال", chelsea: "تشيلسي",
  manutd: "مانشستر يونايتد", spurs: "توتنهام", newcastle: "نيوكاسل", villa: "أستون فيلا",
  westham: "وستهام", brighton: "برايتون",
  // إسبانيا
  real: "ريال مدريد", barca: "برشلونة", atletico: "أتلتيكو مدريد", athletic: "أتلتيك بلباو",
  villarreal: "فياريال", sociedad: "ريال سوسييداد", betis: "ريال بيتيس", sevilla: "إشبيلية",
  valencia: "فالنسيا", getafe: "خيتافي",
  // ألمانيا
  bayern: "بايرن ميونخ", leverkusen: "ليفركوزن", dortmund: "دورتموند", leipzig: "لايبزيغ",
  frankfurt: "آينتراخت فرانكفورت", stuttgart: "شتوتغارت", freiburg: "فرايبورغ", mainz: "ماينتس",
  // إيطاليا
  inter: "إنتر ميلان", milan: "ميلان", juve: "يوفنتوس", napoli: "نابولي", atalanta: "أتالانتا",
  roma: "روما", lazio: "لاتسيو", fiorentina: "فيورنتينا", cagliari: "كالياري",
  // فرنسا
  psg: "باريس سان جيرمان", monaco: "موناكو", marseille: "مارسيليا", lille: "ليل", lyon: "ليون",
  nice: "نيس", lens: "لانس", rennes: "رين", metz: "ميتز",
  // البرتغال وهولندا وتركيا وبلجيكا واسكتلندا
  benfica: "بنفيكا", porto: "بورتو", sporting: "سبورتينغ لشبونة", braga: "براغا",
  ajax: "أياكس", psv: "آيندهوفن", feyenoord: "فاينورد",
  galatasaray: "غلطة سراي", fenerbahce: "فنربخشة", besiktas: "بشكتاش",
  brugge: "كلوب بروج", anderlecht: "أندرلخت", celtic: "سلتيك", rangers: "رينجرز",
  // السعودية وأمريكا والبرازيل
  hilal: "الهلال", nassr: "النصر", ittihad: "الاتحاد", sahli: "الأهلي السعودي",
  miami: "إنتر ميامي", lafc: "لوس أنجلوس", flamengo: "فلامنغو", palmeiras: "بالميراس"
};

/* ---------- 3) الجدول الخام للأندية ----------
   كل سطر: المعرّف | الاسم الإنجليزي | كود الدولة | القوة | معامل الثراء | اللون الأول | اللون الثاني | الاختصار */
const RAW_CLUBS = `raja|Raja Casablanca|MA|66|.4|0a7d3a|ffffff|RCA
wydad|Wydad AC|MA|67|.4|d62027|ffffff|WAC
far|AS FAR|MA|65|.4|0b5a2b|e6c34a|FAR
berkane|RS Berkane|MA|66|.4|f28c28|111111|RSB
mas|MAS Fez|MA|61|.3|f2c230|1a1a1a|MAS
fus|FUS Rabat|MA|58|.3|f6c744|111111|FUS
husa|Hassania Agadir|MA|57|.3|1b5fbf|ffffff|HUSA
safi|Olympic Safi|MA|56|.3|111111|ffffff|OCS
tanger|IR Tanger|MA|57|.3|1b5fbf|ffffff|IRT
dhj|DH El Jadida|MA|56|.3|0b7a3a|ffffff|DHJ
ahly|Al Ahly|EG|68|.5|d8232a|ffffff|AHL
zamalek|Zamalek|EG|64|.4|ffffff|d8232a|ZSC
pyramids|Pyramids FC|EG|63|.5|6cc3e8|ffffff|PYR
sundowns|Mamelodi Sundowns|ZA|67|.5|ffd800|00a651|MSD
esperance|Esperance Tunis|TN|62|.3|e30613|ffd800|EST
mazembe|TP Mazembe|CD|60|.3|111111|ffffff|TPM
mancity|Manchester City|GB|91|1.6|6cabdd|ffffff|MCI
liverpool|Liverpool|GB|88|1.5|c8102e|ffffff|LIV
arsenal|Arsenal|GB|88|1.4|ef0107|ffffff|ARS
chelsea|Chelsea|GB|84|1.4|034694|ffffff|CHE
manutd|Manchester United|GB|82|1.4|da291c|fbe122|MUN
spurs|Tottenham|GB|80|1.3|ffffff|132257|TOT
newcastle|Newcastle|GB|80|1.3|111111|ffffff|NEW
villa|Aston Villa|GB|79|1.2|670e36|95bfe5|AVL
westham|West Ham|GB|74|1.1|7a263a|1bb1e7|WHU
brighton|Brighton|GB|72|1.1|0057b8|ffffff|BHA
real|Real Madrid|ES|90|1.6|ffffff|febe10|RMA
barca|FC Barcelona|ES|88|1.4|a50044|004d98|FCB
atletico|Atletico Madrid|ES|83|1.2|cb3524|ffffff|ATM
athletic|Athletic Club|ES|78|1|ee2523|ffffff|ATH
villarreal|Villarreal|ES|76|1|fbe122|005187|VIL
sociedad|Real Sociedad|ES|75|1|0067b1|ffffff|RSO
betis|Real Betis|ES|75|1|0bb363|ffffff|BET
sevilla|Sevilla|ES|74|.9|ffffff|d71920|SEV
valencia|Valencia|ES|73|.9|ffffff|f58220|VCF
getafe|Getafe|ES|66|.7|005999|ffffff|GET
bayern|Bayern Munich|DE|89|1.5|dc052d|ffffff|BAY
leverkusen|Leverkusen|DE|83|1.1|e32221|111111|B04
dortmund|Dortmund|DE|82|1.1|fde100|111111|BVB
leipzig|RB Leipzig|DE|82|1.1|ffffff|dd0741|RBL
frankfurt|Eintracht Frankfurt|DE|76|1|e1000f|111111|SGE
stuttgart|VfB Stuttgart|DE|76|1|ffffff|e32219|VFB
freiburg|SC Freiburg|DE|70|.8|e1000f|111111|SCF
mainz|Mainz|DE|65|.7|c3141e|ffffff|M05
inter|Inter|IT|85|1.2|0068a8|111111|INT
milan|AC Milan|IT|80|1.1|fb090b|111111|ACM
juve|Juventus|IT|80|1.2|ffffff|111111|JUV
napoli|Napoli|IT|80|1|12a0d7|ffffff|NAP
atalanta|Atalanta|IT|79|1|1e71b8|111111|ATA
roma|AS Roma|IT|77|1|8e1f2f|f0bc42|ROM
lazio|Lazio|IT|76|1|87d8f7|ffffff|LAZ
fiorentina|Fiorentina|IT|74|.9|5b2d8e|ffffff|FIO
cagliari|Cagliari|IT|62|.6|8b1a2b|1a3a8a|CAG
psg|Paris SG|FR|88|1.6|004170|da291c|PSG
monaco|AS Monaco|FR|76|1|e3001b|ffffff|ASM
marseille|Marseille|FR|74|1|2faee0|ffffff|OM
lille|Lille|FR|73|.9|e01e13|1b2a5a|LOSC
lyon|Lyon|FR|73|.9|ffffff|1a3a8a|OL
nice|OGC Nice|FR|72|.9|111111|e01e13|OGCN
lens|RC Lens|FR|71|.8|e8b911|e01e13|RCL
rennes|Rennes|FR|71|.8|e13327|111111|SRFC
metz|Metz|FR|60|.5|8c1d40|ffffff|FCM
benfica|Benfica|PT|77|.9|e30613|ffffff|SLB
porto|FC Porto|PT|77|.9|00428c|ffffff|FCP
sporting|Sporting CP|PT|78|.9|008057|ffffff|SCP
braga|SC Braga|PT|72|.7|e30613|ffffff|SCB
ajax|Ajax|NL|74|.8|d2122e|ffffff|AJA
psv|PSV|NL|76|.8|ee1c25|ffffff|PSV
feyenoord|Feyenoord|NL|75|.8|e2001a|ffffff|FEY
galatasaray|Galatasaray|TR|74|.9|fdb913|a90432|GS
fenerbahce|Fenerbahce|TR|73|.9|fff200|00205b|FB
besiktas|Besiktas|TR|70|.8|111111|ffffff|BJK
brugge|Club Brugge|BE|71|.8|0a6bb0|111111|CLB
anderlecht|Anderlecht|BE|68|.7|5b2d8e|ffffff|RSCA
celtic|Celtic|SC|66|.7|16a34a|ffffff|CEL
rangers|Rangers|SC|65|.7|1b458f|ffffff|RFC
hilal|Al Hilal|SA|76|1.8|0b4ea2|ffffff|HIL
nassr|Al Nassr|SA|74|1.8|fcd116|0b4ea2|NSR
ittihad|Al Ittihad|SA|72|1.7|fcd116|111111|ITT
sahli|Al Ahli Jeddah|SA|70|1.6|0e7a3d|ffffff|AHL
miami|Inter Miami|US|68|1.2|f7b5cd|111111|MIA
lafc|LAFC|US|64|1|c39e6d|111111|LAFC
flamengo|Flamengo|BR|70|.8|c8102e|111111|FLA
palmeiras|Palmeiras|BR|69|.8|006437|ffffff|PAL`;

/* ---------- 4) تحويل الجدول الخام إلى كائنات أندية ---------- */
const ROWS = RAW_CLUBS.split("\n").map(line => {
  const [id, en, cc, s, rich, c1, c2, ab] = line.split("|");
  return {
    id,                         // المعرّف
    en,                         // الاسم الإنجليزي
    ar: AR[id] || en,           // الاسم العربي (أو الإنجليزي إن لم يوجد)
    cc,                         // كود الدولة
    s: +s,                      // قوة النادي
    rich: +rich,                // معامل الثراء (يؤثر في الراتب)
    c1: "#" + c1, c2: "#" + c2, // ألوان الشعار
    ab,                         // اختصار الشعار
    flag: CC[cc][0], country: CC[cc][1], league: CC[cc][3],
    w: CC[cc][2],               // وزن الدوري
    games: CC[cc][4]            // عدد مباريات الموسم
  };
});

/* ---------- 5) فهارس وثوابت مشتقة ---------- */
const _clamp = (x, a, b) => Math.max(a, Math.min(b, x));   // نسخة خاصة لأن engine.js يُحمَّل بعد هذا الملف

const CL = {};                          // البحث بالمعرّف: CL["real"]
ROWS.forEach(c => CL[c.id] = c);

const START = ROWS;                     // الأندية المتاحة عند البداية
const CLUB_PAGE_SIZE = 8;               // عدد الأندية في كل صفحة اختيار
let clubPage = 0;                       // رقم الصفحة الحالية

const AFR = ["MA", "EG", "ZA", "TN", "CD"];                                      // دول إفريقية
const EUR = ["GB", "SC", "ES", "DE", "IT", "FR", "PT", "NL", "TR", "BE"];       // دول أوروبية

/* ---------- 6) احتمالات الألقاب ----------
   pL = احتمال لقب الدوري حسب ترتيب النادي القوي داخل دولته
   pC = احتمال اللقب القاري */
[...new Set(ROWS.map(c => c.cc))].forEach(cc =>
  ROWS.filter(c => c.cc == cc)
      .sort((a, b) => b.s - a.s)
      .forEach((c, i) => c.pL = [.45, .25, .14, .08, .04, .02][i] || .01)
);

// الأندية الإفريقية: الاحتمال القاري يتناقص مع الترتيب
ROWS.filter(c => AFR.includes(c.cc))
    .sort((a, b) => b.s - a.s)
    .forEach((c, i) => c.pC = Math.max(.02, .14 - i * .012));

// الأندية الأوروبية والبقية: الاحتمال القاري يعتمد على القوة
ROWS.forEach(c => {
  if (EUR.includes(c.cc)) c.pC = _clamp((c.s - 74) * .012, 0, .22);
  else if (c.pC == null)  c.pC = _clamp((c.s - 65) * .01, .01, .1);
});

// الأندية الكبرى (قوة 84+) تُستعمل في أخبار الانتقال المزعومة
const BIG = ROWS.filter(c => c.s >= 84);
