import { useEffect, useState } from "react";

interface TopBarProps {
  isRecording: boolean;
}

function format(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Brand, REC indicator and elapsed time. UI only, never part of the recorded video. */
export function TopBar({ isRecording }: TopBarProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isRecording) {
      setSeconds(0);
      return;
    }
    const startedAt = Date.now();
    const id = window.setInterval(() => setSeconds(Math.floor((Date.now() - startedAt) / 1000)), 500);
    return () => window.clearInterval(id);
  }, [isRecording]);

  return (
    <header className="topbar">
      <strong className="topbar__brand" dir="ltr">BLV PLAY</strong>
      <span className={isRecording ? "rec is-live" : "rec"} dir="ltr">
        {isRecording ? `● REC ${format(seconds)}` : "READY"}
      </span>
    </header>
  );
}
