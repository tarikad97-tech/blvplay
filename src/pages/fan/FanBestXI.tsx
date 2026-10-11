import { useMemo, useState } from "react";
import { Face } from "../../components/Face";
import { useResult } from "../../context/ResultContext";
import { berkane2025, fes2026, type Entrant } from "../../data/teams";
import { useSlots } from "../../hooks/useSlots";
import { useNavigate } from "../../lib/router";
import { GameShell } from "./GameShell";

type Group = "GK" | "DEF" | "MID" | "ATT";

const GROUP_BY_ROLE: Record<string, Group> = {
  "حارس مرمى": "GK",
  "قلب دفاع": "DEF", "ظهير": "DEF", "مدافع": "DEF",
  "وسط دفاعي": "MID", "وسط": "MID", "وسط متقدم": "MID",
  "جناح": "ATT", "مهاجم": "ATT", "مهاجم/جناح": "ATT"
};

const GROUP_LABEL: Record<Group, string> = { GK: "حارس المرمى", DEF: "مدافع", MID: "لاعب وسط", ATT: "مهاجم" };

/** 4-3-3. x / y are percentages on the pitch (y = 0 is the opponent's goal). */
const FORMATION: readonly { group: Group; label: string; x: number; y: number }[] = [
  { group: "GK", label: "حارس", x: 50, y: 90 },
  { group: "DEF", label: "ظهير أيمن", x: 86, y: 70 },
  { group: "DEF", label: "قلب دفاع", x: 62, y: 74 },
  { group: "DEF", label: "قلب دفاع", x: 38, y: 74 },
  { group: "DEF", label: "ظهير أيسر", x: 14, y: 70 },
  { group: "MID", label: "وسط", x: 74, y: 50 },
  { group: "MID", label: "وسط", x: 50, y: 54 },
  { group: "MID", label: "وسط", x: 26, y: 50 },
  { group: "ATT", label: "جناح أيمن", x: 84, y: 24 },
  { group: "ATT", label: "مهاجم", x: 50, y: 18 },
  { group: "ATT", label: "جناح أيسر", x: 16, y: 24 }
];

interface Pick extends Entrant { teamName: string }

export function FanBestXI({ onExit }: { onExit: () => void }) {
  const navigate = useNavigate();
  const { setResult } = useResult();
  const { slots, filled, isComplete, place, clear, reset } = useSlots<Pick>(FORMATION.length);
  const [selected, setSelected] = useState(0);

  const pool = useMemo<Pick[]>(
    () => [berkane2025, fes2026].flatMap((t) => t.players.map((p) => ({ ...p, teamName: t.name }))),
    []
  );

  const used = new Set(slots.filter((s): s is Pick => s !== null).map((p) => p.id));
  const group = FORMATION[selected].group;
  const available = pool.filter((p) => GROUP_BY_ROLE[p.roleLabel] === group && !used.has(p.id));

  function pick(p: Pick) {
    place(p, selected);
    // Move to the next empty slot (after the current one first, then from the start).
    const after = slots.findIndex((s, i) => i > selected && s === null);
    const any = slots.findIndex((s, i) => i !== selected && s === null);
    setSelected(after >= 0 ? after : any >= 0 ? any : selected);
  }

  function tapSlot(i: number) {
    if (slots[i]) clear(i);
    setSelected(i);
  }

  function finish() {
    const picks = slots as readonly Pick[];
    const fromA = picks.filter((p) => p.teamName === berkane2025.name).length;
    setResult({
      challengeId: "best-xi",
      title: "أفضل تشكيلة أساسية",
      headline: "تشكيلتك بخطة 4-3-3",
      detail: `${fromA} لاعبين من ${berkane2025.name} و${picks.length - fromA} من ${fes2026.name}`,
      items: picks.map((p, i) => ({ label: FORMATION[i].label, name: p.name, image: p.image, sub: p.teamName }))
    });
    navigate("/results");
  }

  return (
    <GameShell
      title="أفضل تشكيلة 4-3-3"
      question={isComplete ? "تشكيلتك جاهزة!" : `اختر ${GROUP_LABEL[group]}`}
      progressLabel={`${filled} / ${FORMATION.length}`}
      progress={filled / FORMATION.length}
      onExit={onExit}
    >
      <div className="xi" role="group" aria-label="ملعب التشكيلة">
        <div className="xi__lines" aria-hidden="true" />
        {FORMATION.map((f, i) => {
          const p = slots[i];
          return (
            <button
              key={i}
              type="button"
              className={`xi__slot${p ? " is-filled" : ""}${selected === i && !isComplete ? " is-selected" : ""}`}
              style={{ left: `${f.x}%`, top: `${f.y}%` }}
              onClick={() => tapSlot(i)}
              aria-label={p ? `${f.label}: ${p.name}، اضغط للاستبدال` : `${f.label} فارغ`}
            >
              {p ? <Face name={p.name} image={p.image} size="sm" /> : <span className="xi__plus">+</span>}
              <span className="xi__name">{p ? p.name : f.label}</span>
            </button>
          );
        })}
      </div>

      {!isComplete && (
        <div className="pool" role="group" aria-label={`اللاعبون المتاحون: ${GROUP_LABEL[group]}`}>
          {available.length ? available.map((p) => (
            <button key={p.id} type="button" className="pcard" onClick={() => pick(p)}>
              <Face name={p.name} image={p.image} />
              <span>{p.name}</span>
              <small className="muted">{p.teamName}</small>
            </button>
          )) : <p className="empty">لا يوجد لاعبون متاحون لهذا المركز.</p>}
        </div>
      )}

      <div className="game__actions">
        <button type="button" className="btn btn--ghost" onClick={() => { reset(); setSelected(0); }} disabled={filled === 0}>ابدأ من جديد</button>
        {isComplete && <button type="button" className="btn btn--primary" onClick={finish}>عرض النتيجة</button>}
      </div>
      <p className="muted center">اضغط على لاعب في الملعب لاستبداله.</p>
    </GameShell>
  );
}
