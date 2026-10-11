import { useCallback, useState } from "react";

/** Fixed-size list of slots that can be filled, emptied and replaced (used by the fan-mode games). */
export function useSlots<T>(size: number) {
  const [slots, setSlots] = useState<readonly (T | null)[]>(() => Array<T | null>(size).fill(null));

  /** Puts `item` in `index`, or in the first empty slot. Returns the slot it went to (-1 if full). */
  const place = useCallback(
    (item: T, index?: number): number => {
      let target = -1;
      setSlots((prev) => {
        const i = index ?? prev.indexOf(null);
        if (i < 0 || i >= prev.length) return prev;
        target = i;
        const next = [...prev];
        next[i] = item;
        return next;
      });
      return target;
    },
    []
  );

  const clear = useCallback((index: number) => {
    setSlots((prev) => prev.map((v, i) => (i === index ? null : v)));
  }, []);

  /** Empties the most recently filled slot (slots fill in order, so the last non-empty one). */
  const undo = useCallback(() => {
    setSlots((prev) => {
      const i = prev.map((v) => v !== null).lastIndexOf(true);
      return i < 0 ? prev : prev.map((v, j) => (j === i ? null : v));
    });
  }, []);

  const reset = useCallback(() => setSlots(Array<T | null>(size).fill(null)), [size]);

  const filled = slots.filter((s) => s !== null).length;
  return { slots, filled, isComplete: filled === size, place, clear, undo, reset };
}
