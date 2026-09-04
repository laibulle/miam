import { useCallback, useEffect, useRef, useState } from 'react';

export type CountdownStatus = 'idle' | 'running' | 'paused' | 'done';

export interface UseCountdownResult {
  remainingSeconds: number;
  status: CountdownStatus;
  start: (durationSeconds: number) => void;
  togglePause: () => void;
  dismiss: () => void;
}

export function useCountdown(): UseCountdownResult {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [status, setStatus] = useState<CountdownStatus>('idle');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => clearTick, [clearTick]);

  const tick = useCallback(() => {
    setRemainingSeconds((prev) => {
      if (prev <= 1) {
        clearTick();
        setStatus('done');
        return 0;
      }
      return prev - 1;
    });
  }, [clearTick]);

  const start = useCallback(
    (durationSeconds: number) => {
      clearTick();
      setRemainingSeconds(durationSeconds);
      setStatus('running');
      intervalRef.current = setInterval(tick, 1000);
    },
    [clearTick, tick]
  );

  const togglePause = useCallback(() => {
    setStatus((prevStatus) => {
      if (prevStatus === 'running') {
        clearTick();
        return 'paused';
      }
      if (prevStatus === 'paused') {
        intervalRef.current = setInterval(tick, 1000);
        return 'running';
      }
      return prevStatus;
    });
  }, [clearTick, tick]);

  const dismiss = useCallback(() => {
    clearTick();
    setStatus('idle');
    setRemainingSeconds(0);
  }, [clearTick]);

  return { remainingSeconds, status, start, togglePause, dismiss };
}
