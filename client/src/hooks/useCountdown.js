import { useState, useEffect } from 'react';
import { formatTimeLeft } from '../utils/date';

export function useCountdown(targetDate) {
  const calculateRemaining = () => {
    if (!targetDate) return 0;
    const target = new Date(targetDate).getTime();
    const now = Date.now();
    const diff = Math.floor((target - now) / 1000);
    return Math.max(0, diff);
  };

  const [secondsLeft, setSecondsLeft] = useState(calculateRemaining);

  useEffect(() => {
    setSecondsLeft(calculateRemaining());

    if (!targetDate) return;

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return {
    secondsLeft,
    formattedTime: formatTimeLeft(secondsLeft),
    isExpired: secondsLeft <= 0
  };
}
