/** Original SVG illustrations built from the product's own UI (no stock imagery, no real people). */

const GRASS = "#1fa463";

export function PitchArt({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 320 420" role="img" aria-label="ملعب تكتيكي بخطة 4-3-3">
      <rect width="320" height="420" rx="22" fill="#0b1f15" />
      <g fill="none" stroke={GRASS} strokeOpacity=".55" strokeWidth="2">
        <rect x="16" y="16" width="288" height="388" rx="6" />
        <line x1="16" y1="210" x2="304" y2="210" />
        <circle cx="160" cy="210" r="42" />
        <rect x="78" y="16" width="164" height="64" />
        <rect x="78" y="340" width="164" height="64" />
      </g>
      {[
        [160, 372], [58, 300], [124, 312], [196, 312], [262, 300],
        [78, 225], [160, 238], [242, 225], [62, 120], [160, 100], [258, 120]
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="17" fill="#f4f7f2" />
          <circle cx={x} cy={y} r="17" fill="none" stroke={GRASS} strokeWidth="3" />
        </g>
      ))}
    </svg>
  );
}

export function PhoneArt({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 420" role="img" aria-label="هاتف يعرض تحدي لاعب ضد لاعب أثناء التصوير">
      <rect x="6" y="6" width="228" height="408" rx="30" fill="#07110d" stroke="#2a3a31" strokeWidth="4" />
      <rect x="22" y="40" width="196" height="26" rx="13" fill="#10241a" />
      <circle cx="36" cy="53" r="5" fill="#e04141" />
      <text x="48" y="58" fontSize="12" fill="#f4f7f2" fontFamily="sans-serif">REC 00:42</text>
      <text x="120" y="130" textAnchor="middle" fontSize="15" fill="#f4f7f2" fontWeight="700">من الأفضل؟</text>
      <g>
        <rect x="26" y="170" width="86" height="120" rx="14" fill="#10241a" stroke={GRASS} strokeWidth="2" />
        <rect x="128" y="170" width="86" height="120" rx="14" fill="#10241a" stroke="#2a3a31" strokeWidth="2" />
        <circle cx="69" cy="214" r="24" fill="#f4f7f2" opacity=".9" />
        <circle cx="171" cy="214" r="24" fill="#f4f7f2" opacity=".9" />
        <rect x="42" y="256" width="54" height="8" rx="4" fill="#f4f7f2" opacity=".7" />
        <rect x="144" y="256" width="54" height="8" rx="4" fill="#f4f7f2" opacity=".7" />
      </g>
      <text x="120" y="336" textAnchor="middle" fontSize="22" fill={GRASS} fontWeight="800" fontFamily="sans-serif">3 – 2</text>
      <rect x="40" y="360" width="160" height="30" rx="15" fill={GRASS} />
    </svg>
  );
}

export function CardsArt({ className }: { className?: string }) {
  const labels = ["GK", "DF", "MF", "FW"];
  return (
    <svg className={className} viewBox="0 0 420 300" role="img" aria-label="بطاقات لاعبين">
      {labels.map((label, i) => (
        <g key={label} transform={`translate(${24 + i * 92} ${i % 2 ? 40 : 14}) rotate(${(i - 1.5) * 5} 40 90)`}>
          <rect width="84" height="140" rx="14" fill="#10241a" stroke={i === 2 ? GRASS : "#2a3a31"} strokeWidth="2.5" />
          <circle cx="42" cy="52" r="24" fill="#f4f7f2" opacity=".92" />
          <rect x="14" y="96" width="56" height="8" rx="4" fill="#f4f7f2" opacity=".75" />
          <text x="42" y="124" textAnchor="middle" fontSize="12" fill={GRASS} fontWeight="800" fontFamily="sans-serif">{label}</text>
        </g>
      ))}
    </svg>
  );
}

export function LadderArt({ className }: { className?: string }) {
  const ages = [17, 20, 24, 28, 32];
  return (
    <svg className={className} viewBox="0 0 420 300" role="img" aria-label="سلّم أعمار مسيرة لاعب">
      {ages.map((a, i) => (
        <g key={a} transform={`translate(${30 + i * 8} ${20 + i * 52})`}>
          <rect width="64" height="38" rx="8" fill={i === 2 ? "#f6c744" : "#10241a"} stroke={GRASS} strokeWidth="2" />
          <text x="32" y="26" textAnchor="middle" fontSize="20" fontWeight="800" fill={i === 2 ? "#111" : "#f4f7f2"} fontFamily="sans-serif">{a}</text>
          <rect x="76" width={200 + (i % 3) * 30} height="38" rx="8" fill="#f4f7f2" opacity=".92" />
          <rect x="76" width="6" height="38" fill={GRASS} />
        </g>
      ))}
    </svg>
  );
}
