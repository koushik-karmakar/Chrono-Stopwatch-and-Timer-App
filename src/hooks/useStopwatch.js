import { useState, useRef, useCallback } from "react";

export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);

  const startTimeRef = useRef(0);
  const elapsedRef = useRef(0);
  const lapStartRef = useRef(0);
  const rafRef = useRef(null);

  const tick = useCallback(() => {
    const now = Date.now();
    elapsedRef.current = now - startTimeRef.current;
    setElapsed(elapsedRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    const now = Date.now();
    startTimeRef.current = now - elapsedRef.current;
    if (lapStartRef.current === 0)
      lapStartRef.current = now - elapsedRef.current;
    setRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const pause = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
    elapsedRef.current = 0;
    lapStartRef.current = 0;
    setElapsed(0);
    setLaps([]);
  }, []);

  const lap = useCallback(() => {
    const now = Date.now();
    const total = now - startTimeRef.current;
    const lapTime = now - lapStartRef.current;
    lapStartRef.current = now;
    setLaps((prev) => [...prev, { num: prev.length + 1, total, lapTime }]);
  }, []);

  return { elapsed, running, laps, start, pause, reset, lap };
}
