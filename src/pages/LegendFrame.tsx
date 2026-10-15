import { useEffect, useState } from "react";
import { useMeta } from "../lib/useMeta";

/**
 * "طريق الأسطورة" is a self-contained filter (public/legend/index.html) with its own camera,
 * recording and results. It is embedded unchanged; ?mode=fan switches it to the no-camera version.
 *
 * The page posts {legend:"play"} when the game starts and {legend:"end"} when it finishes, so the
 * top bar can be hidden during play. The iframe keeps the same position in the tree, so it is
 * never remounted and the camera is never restarted.
 */
export function LegendFrame({ mode, onExit }: { mode: "creator" | "fan"; onExit: () => void }) {
  useMeta("طريق الأسطورة", "ابدأ لاعباً مغربياً بعمر 17 سنة وقرر مسيرتك حتى الاعتزال.");
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.legend === "play") setPlaying(true);
      else if (e.data?.legend === "end") setPlaying(false);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const src = mode === "fan" ? "/legend/index.html?mode=fan" : "/legend/index.html";
  return (
    <div className={"embed" + (playing ? " embed--playing" : "")}>
      {!playing && (
        <div className="embed__bar">
          <button type="button" className="link-button" onClick={onExit}>→ التحديات</button>
          <strong dir="ltr">BLV PLAY</strong>
        </div>
      )}
      <iframe
        className="embed__frame"
        title="طريق الأسطورة"
        src={src}
        allow={mode === "creator" ? "camera; microphone; autoplay; fullscreen" : "autoplay"}
      />
    </div>
  );
}