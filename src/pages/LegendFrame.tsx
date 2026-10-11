import { useMeta } from "../lib/useMeta";

/**
 * "طريق الأسطورة" is a self-contained filter (public/legend/index.html) with its own camera,
 * recording and results. It is embedded unchanged; ?mode=fan switches it to the no-camera version.
 */
export function LegendFrame({ mode, onExit }: { mode: "creator" | "fan"; onExit: () => void }) {
  useMeta("طريق الأسطورة", "ابدأ لاعباً مغربياً بعمر 17 سنة وقرر مسيرتك حتى الاعتزال.");
  const src = mode === "fan" ? "/legend/index.html?mode=fan" : "/legend/index.html";
  return (
    <div className="embed">
      <div className="embed__bar">
        <button type="button" className="link-button" onClick={onExit}>→ التحديات</button>
        <strong dir="ltr">BLV PLAY</strong>
      </div>
      <iframe
        className="embed__frame"
        title="طريق الأسطورة"
        src={src}
        allow={mode === "creator" ? "camera; microphone; autoplay; fullscreen" : "autoplay"}
      />
    </div>
  );
}
