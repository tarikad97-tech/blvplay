import { Face } from "../../components/Face";
import { useResult } from "../../context/ResultContext";
import { players, type Player } from "../../data/players";
import { RANK_5 } from "../../data/templates";
import { useSlots } from "../../hooks/useSlots";
import { useNavigate } from "../../lib/router";
import { GameShell } from "./GameShell";

export function FanRank5({ onExit }: { onExit: () => void }) {
  const navigate = useNavigate();
  const { setResult } = useResult();
  const { slots, filled, isComplete, place, clear, undo, reset } = useSlots<Player>(RANK_5.slots);

  const used = new Set(slots.filter((s): s is Player => s !== null).map((p) => p.id));
  const available = players.filter((p) => !used.has(p.id));
  const nextIndex = slots.indexOf(null);

  function finish() {
    setResult({
      challengeId: "rank-5",
      title: "رتّب أفضل 5 لاعبين",
      headline: "ترتيبك لأفضل 5 لاعبين مغاربة",
      detail: "اكتمل التحدي 5/5",
      items: slots.map((p, i) => ({ label: `المرتبة ${i + 1}`, name: p!.name, image: p!.image }))
    });
    navigate("/results");
  }

  return (
    <GameShell
      title="رتّب أفضل 5"
      question={isComplete ? "ترتيبك جاهز!" : `اختر اللاعب صاحب المرتبة ${RANK_5.rankLabels[nextIndex]}`}
      progressLabel={`${filled} / ${RANK_5.slots}`}
      progress={filled / RANK_5.slots}
      onExit={onExit}
    >
      <ol className="slots">
        {slots.map((p, i) => (
          <li key={i}>
            <button type="button" className={p ? "slot is-filled" : "slot"} disabled={!p} onClick={() => clear(i)} aria-label={p ? `إزالة ${p.name} من المرتبة ${i + 1}` : `المرتبة ${i + 1} فارغة`}>
              <b>{i + 1}</b>
              {p ? <><Face name={p.name} image={p.image} size="sm" /><span>{p.name}</span><i aria-hidden="true">✕</i></> : <span className="muted">—</span>}
            </button>
          </li>
        ))}
      </ol>

      {!isComplete && (
        <div className="pool" role="group" aria-label="اللاعبون المتاحون">
          {available.map((p) => (
            <button key={p.id} type="button" className="pcard" onClick={() => place(p)}>
              <Face name={p.name} image={p.image} />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="game__actions">
        <button type="button" className="btn btn--ghost" onClick={undo} disabled={filled === 0}>تراجع</button>
        <button type="button" className="btn btn--ghost" onClick={reset} disabled={filled === 0}>ابدأ من جديد</button>
        {isComplete && <button type="button" className="btn btn--primary" onClick={finish}>عرض النتيجة</button>}
      </div>
    </GameShell>
  );
}
