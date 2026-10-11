import { useEffect, useState } from "react";
import { Face } from "../../components/Face";
import { useResult } from "../../context/ResultContext";
import { BERKANE_VS_FES, type Side } from "../../data/battles";
import { useNavigate } from "../../lib/router";
import { GameShell } from "./GameShell";

const battle = BERKANE_VS_FES;
const TOTAL = battle.rounds.length;
const FLASH_MS = 550;

export function FanBattle({ onExit }: { onExit: () => void }) {
  const navigate = useNavigate();
  const { setResult } = useResult();
  const [choices, setChoices] = useState<readonly Side[]>([]);
  const [flash, setFlash] = useState<Side | null>(null);

  const index = choices.length;
  const done = index >= TOTAL;
  const round = done ? null : battle.rounds[index];
  const score = { a: choices.filter((s) => s === "a").length, b: choices.filter((s) => s === "b").length };

  // Briefly show the picked side before moving on; taps are ignored meanwhile.
  useEffect(() => {
    if (!flash) return;
    const id = window.setTimeout(() => {
      setChoices((prev) => [...prev, flash]);
      setFlash(null);
    }, FLASH_MS);
    return () => window.clearTimeout(id);
  }, [flash]);

  function choose(side: Side) {
    if (flash || done) return;
    setFlash(side);
  }

  function undo() {
    if (flash) return;
    setChoices((prev) => prev.slice(0, -1));
  }

  function finish() {
    const winner = score.a === score.b ? null : score.a > score.b ? battle.teamA : battle.teamB;
    const hi = Math.max(score.a, score.b);
    const lo = Math.min(score.a, score.b);
    setResult({
      challengeId: "team-battle",
      title: "بطل 2025 ضد بطل 2026",
      headline: winner ? `فاز ${winner.name} ${winner.title} (${hi}–${lo})` : `تعادل ${hi}–${lo}`,
      detail: `${battle.teamA.name} ${battle.teamA.title}: ${score.a} — ${battle.teamB.name} ${battle.teamB.title}: ${score.b}`,
      items: battle.rounds.map((r, i) => {
        const side = choices[i];
        const e = side === "a" ? r.a : r.b;
        const team = side === "a" ? battle.teamA : battle.teamB;
        return { label: r.label, name: e.name, image: e.image, sub: team.name };
      })
    });
    navigate("/results");
  }

  return (
    <GameShell
      title="بطل 2025 ضد بطل 2026"
      question={done ? "انتهت المواجهات!" : `${round!.label}: من الأفضل؟`}
      progressLabel={`${Math.min(index + 1, TOTAL)} / ${TOTAL}`}
      progress={index / TOTAL}
      onExit={onExit}
    >
      <div className="scorebar" aria-label="النتيجة">
        <span style={{ color: battle.teamA.color }}>{battle.teamA.name} {battle.teamA.title}</span>
        <strong dir="ltr">{score.a} – {score.b}</strong>
        <span style={{ color: battle.teamB.color }}>{battle.teamB.name} {battle.teamB.title}</span>
      </div>

      {round && (
        <div className="versus">
          {([["a", round.a, battle.teamA], ["b", round.b, battle.teamB]] as const).map(([side, e, team]) => (
            <button
              key={side}
              type="button"
              className={flash === side ? "vcard is-picked" : flash ? "vcard is-dim" : "vcard"}
              style={{ borderColor: flash === side ? team.color : undefined }}
              onClick={() => choose(side)}
              aria-label={`اختر ${e.name}`}
            >
              <Face name={e.name} image={e.image} size="lg" />
              <strong>{e.name}</strong>
              <span className="muted">{e.roleLabel}</span>
              <span className="vcard__team" style={{ color: team.color }}>{team.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="game__actions">
        <button type="button" className="btn btn--ghost" onClick={undo} disabled={index === 0}>تراجع</button>
        {done && <button type="button" className="btn btn--primary" onClick={finish}>عرض النتيجة</button>}
      </div>
    </GameShell>
  );
}
