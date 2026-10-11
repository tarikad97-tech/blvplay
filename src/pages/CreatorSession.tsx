import { useEffect, useState } from "react";
import type { RecordingResult } from "../hooks/useRecorder";
import { getChallenge } from "../data/challenges";
import { Navigate, useNavigate } from "../lib/router";
import { useMeta } from "../lib/useMeta";
import { BattleStudio } from "./BattleStudio";
import { LegendFrame } from "./LegendFrame";
import { Preview } from "./Preview";
import { Studio } from "./Studio";

/** Creator Mode: instructions → camera → recording (existing studios, unchanged) → preview. */
export function CreatorSession({ id }: { id: string }) {
  const challenge = getChallenge(id);
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [recording, setRecording] = useState<RecordingResult | null>(null);
  const [hasRecorded, setHasRecorded] = useState(false);
  useMeta(challenge ? `صوّر: ${challenge.title}` : "تحدٍّ غير موجود", "تسجيل تحدي كرة قدم بالكاميرا والميكروفون.");

  // Free the video blob whenever it is replaced, discarded, or the page is left.
  useEffect(() => {
    if (!recording) return;
    return () => URL.revokeObjectURL(recording.url);
  }, [recording]);

  if (!challenge || !challenge.modes.includes("creator")) return <Navigate to="/create" />;

  const goBack = () => navigate("/create");

  if (!started) {
    return (
      <main className="app">
        <section className="studio">
          <div className="gate">
            <h1 className="gate__title">{challenge.title}</h1>
            <ol className="gate__list">
              {challenge.creatorSteps.map((s) => <li key={s}>{s}</li>)}
            </ol>
            <button type="button" className="cta" onClick={() => setStarted(true)}>فهمت، تابع</button>
            <button type="button" className="link-button" onClick={goBack}>تغيير التحدي</button>
          </div>
        </section>
      </main>
    );
  }

  if (challenge.id === "career-legend") return <LegendFrame mode="creator" onExit={goBack} />;

  if (recording) {
    return (
      <Preview
        recording={recording}
        filenameBase={`blv-play-${challenge.id}`}
        onRetake={() => setRecording(null)}
        onHome={goBack}
      />
    );
  }

  const studioProps = {
    autoStartCamera: hasRecorded,
    onFinished: (r: RecordingResult) => {
      setHasRecorded(true);
      setRecording(r);
    },
    onHome: goBack
  };
  return challenge.id === "rank-5" ? <Studio {...studioProps} /> : <BattleStudio {...studioProps} />;
}
