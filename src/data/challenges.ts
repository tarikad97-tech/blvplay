export type PlayMode = "creator" | "fan";

export interface Challenge {
  id: "career-legend" | "rank-5" | "team-battle" | "best-xi";
  title: string;
  description: string;
  /** Filter category shown on the challenges page. */
  type: string;
  /** Extra tag (competition / theme) used by the filters. */
  topic: string;
  /** Modes that really exist for this challenge. */
  modes: readonly PlayMode[];
  /** Approximate length, shown on the card. */
  duration: string;
  /** Creator-mode instructions shown before the camera starts. */
  creatorSteps: readonly string[];
}

export const CHALLENGES: readonly Challenge[] = [
  {
    id: "career-legend",
    title: "طريق الأسطورة",
    description: "ابدأ لاعباً مغربياً بعمر 17 سنة، اختر ناديك وقراراتك وعروض الانتقال حتى الاعتزال، وشاهد هل تصبح أسطورة.",
    type: "مسيرة لاعب",
    topic: "كرة القدم المغربية",
    modes: ["creator", "fan"],
    duration: "3 إلى 5 دقائق",
    creatorSteps: [
      "اكتب اسم لاعبك واختر مركزه، ثم شغّل الكاميرا والميكروفون.",
      "بعد عدّ تنازلي من 3 ثوانٍ اختر ناديك الأول، ثم قرارات مسيرتك وعروض الانتقال من 17 إلى 38 سنة، وعلّق بصوتك.",
      "ينتهي التسجيل ببطاقة الاعتزال، ثم يظهر الفيديو لتحميله."
    ]
  },
];

export function getChallenge(id: string | undefined): Challenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}

export function modeLabel(modes: readonly PlayMode[]): string {
  if (modes.length === 2) return "تصوير أو بدون تصوير";
  return modes[0] === "creator" ? "للتصوير" : "بدون تصوير";
}
