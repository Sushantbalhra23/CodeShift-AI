import React, { useEffect, useRef, useState } from 'react';

interface StatCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number; // ms
  decimals?: number;
  className?: string;
}

export const StatCounter: React.FC<StatCounterProps> = ({
  value,
  suffix = '',
  prefix = '',
  duration = 1500,
  decimals = 0,
  className = '',
}) => {
  const [display, setDisplay] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const hasRun = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasRun.current) {
          hasRun.current = true;
          const animate = (timestamp: number) => {
            if (!startTime.current) startTime.current = timestamp;
            const progress = Math.min((timestamp - startTime.current) / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(parseFloat((eased * value).toFixed(decimals)));
            if (progress < 1) {
              rafRef.current = requestAnimationFrame(animate);
            } else {
              setDisplay(value);
            }
          };
          rafRef.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}{decimals > 0 ? display.toFixed(decimals) : Math.floor(display)}{suffix}
    </span>
  );
};
