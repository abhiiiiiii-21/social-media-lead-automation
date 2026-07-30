"use client";

import React, { useEffect, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number; // ms
  className?: string;
  format?: (val: number) => string;
}

export function AnimatedCounter({ 
  value, 
  duration = 500,
  className,
  format = (val) => val.toLocaleString()
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = displayValue;
    const endValue = value;

    if (startValue === endValue) return;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setDisplayValue(Math.floor(startValue + (endValue - startValue) * easeProgress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
      }
    };

    requestAnimationFrame(animate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <span className={className}>{format(displayValue)}</span>;
}
