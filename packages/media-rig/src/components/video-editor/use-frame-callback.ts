import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

/** Coalesce pointer updates; callers commit the exact final value on pointerup. */
export function useFrameCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
) {
  const latest = useRef(callback);
  const pending = useRef<Args | null>(null);
  const frame = useRef<number | null>(null);
  useLayoutEffect(() => {
    latest.current = callback;
  }, [callback]);
  const cancel = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    pending.current = null;
  }, []);
  useEffect(() => cancel, [cancel]);
  const schedule = useCallback((...args: Args) => {
    pending.current = args;
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const value = pending.current;
      pending.current = null;
      if (value) latest.current(...value);
    });
  }, []);
  return { schedule, cancel };
}
