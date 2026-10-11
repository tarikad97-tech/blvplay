import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export interface ResultItem {
  label: string;
  name: string;
  /** Public photo URL; the share image falls back to initials when it can't load. */
  image: string;
  sub?: string;
}

export interface ChallengeResult {
  challengeId: string;
  title: string;
  headline: string;
  detail: string;
  items: readonly ResultItem[];
}

interface ResultContextValue {
  result: ChallengeResult | null;
  setResult: (result: ChallengeResult | null) => void;
}

const KEY = "blv-last-result";
const ResultContext = createContext<ResultContextValue | null>(null);

function load(): ChallengeResult | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ChallengeResult) : null;
  } catch {
    return null;
  }
}

/** Keeps the last finished challenge so /results survives a refresh (tab storage only, nothing is sent anywhere). */
export function ResultProvider({ children }: { children: ReactNode }) {
  const [result, setState] = useState<ChallengeResult | null>(load);

  const setResult = useCallback((next: ChallengeResult | null) => {
    setState(next);
    try {
      if (next) sessionStorage.setItem(KEY, JSON.stringify(next));
      else sessionStorage.removeItem(KEY);
    } catch {
      /* storage unavailable: the in-memory value is enough */
    }
  }, []);

  const value = useMemo(() => ({ result, setResult }), [result, setResult]);
  return <ResultContext.Provider value={value}>{children}</ResultContext.Provider>;
}

export function useResult(): ResultContextValue {
  const ctx = useContext(ResultContext);
  if (!ctx) throw new Error("useResult must be used inside ResultProvider");
  return ctx;
}
