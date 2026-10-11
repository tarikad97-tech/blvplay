import type { ReactNode } from "react";

interface GameShellProps {
  title: string;
  question: string;
  /** e.g. "3 / 5" */
  progressLabel: string;
  progress: number;
  onExit: () => void;
  children: ReactNode;
}

/** Shared frame for every fan-mode challenge: dark pitch backdrop, title, progress. No camera. */
export function GameShell({ title, question, progressLabel, progress, onExit, children }: GameShellProps) {
  return (
    <div className="game">
      <div className="game__pitch" aria-hidden="true" />
      <div className="game__inner">
        <header className="game__top">
          <button type="button" className="link-button" onClick={onExit}>→ التحديات</button>
          <strong className="game__title">{title}</strong>
          <span className="game__count" dir="ltr">{progressLabel}</span>
        </header>
        <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
          <span style={{ width: `${progress * 100}%` }} />
        </div>
        <h1 className="game__question" aria-live="polite">{question}</h1>
        {children}
      </div>
    </div>
  );
}
