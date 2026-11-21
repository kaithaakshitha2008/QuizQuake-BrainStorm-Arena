import { useState, useEffect, useRef, useCallback } from 'react';

interface UseQuizTimerProps {
  expiresAt: string | Date | null;
  onExpire?: () => void;
  isActive?: boolean;
}

export function useQuizTimer({ expiresAt, onExpire, isActive = true }: UseQuizTimerProps) {
  const calculateRemainingSeconds = useCallback((): number => {
    if (!expiresAt) return 0;
    const targetMs = new Date(expiresAt).getTime();
    const nowMs = Date.now();
    const diffSeconds = Math.floor((targetMs - nowMs) / 1000);
    return Math.max(0, diffSeconds);
  }, [expiresAt]);

  const [secondsLeft, setSecondsLeft] = useState<number>(calculateRemainingSeconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const expiredTriggered = useRef(false);

  useEffect(() => {
    expiredTriggered.current = false;
    setSecondsLeft(calculateRemainingSeconds());
  }, [expiresAt, calculateRemainingSeconds]);

  useEffect(() => {
    if (!isActive || !expiresAt) return;

    const interval = setInterval(() => {
      const remaining = calculateRemainingSeconds();
      setSecondsLeft(remaining);

      if (remaining <= 0 && !expiredTriggered.current) {
        expiredTriggered.current = true;
        clearInterval(interval);
        if (onExpireRef.current) {
          onExpireRef.current();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, isActive, calculateRemainingSeconds]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isWarning = secondsLeft <= 120 && secondsLeft > 0; // <= 2 minutes remaining
  const isDanger = secondsLeft <= 60 && secondsLeft > 0; // <= 1 minute remaining
  const isExpired = secondsLeft <= 0;

  return {
    secondsLeft,
    formattedTime,
    isWarning,
    isDanger,
    isExpired,
  };
}
