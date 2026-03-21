import { useEffect, useState } from 'react';

export function useCountUp(target: number, duration: number = 2000, suffix: string = '', prefix: string = '') {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Ease out expo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(Math.floor(easeProgress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [target, duration]);

  const formatNumber = (n: number) => {
    if (n < 1000) return n.toString();
    if (n < 1000000) return (n / 1000).toFixed(1) + 'K';
    if (n < 1000000000) return (n / 1000000).toFixed(1) + 'M';
    return (n / 1000000000).toFixed(1) + 'B';
  };

  return `${prefix}${formatNumber(count)}${suffix}`;
}

export function useLiveTicker(ratePerSecond: number, initialValue: number) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(prev => prev + ratePerSecond / 10);
    }, 100);
    return () => clearInterval(interval);
  }, [ratePerSecond]);

  const formatNumber = (n: number) => {
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  return formatNumber(value);
}

export function useDailyTicker(dailyTotal: number) {
  const ratePerSecond = dailyTotal / 86400;
  
  const getInitialValue = () => {
    const now = new Date();
    const secondsSinceMidnight = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();
    return ratePerSecond * secondsSinceMidnight;
  };

  const [value, setValue] = useState(getInitialValue());

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(prev => prev + ratePerSecond / 10);
    }, 100);
    return () => clearInterval(interval);
  }, [ratePerSecond]);

  const formatNumber = (n: number) => {
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  return formatNumber(value);
}
