'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { CircularCountdownProps } from '@/types/minigame';

import { memo } from 'react';

export const CircularCountdown = memo(function CircularCountdown({
  duration,
  onComplete,
  isActive,
  size = 96,
  key: resetKey
}: CircularCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCompletedRef = useRef(false);

  // Memoize the onComplete callback to prevent unnecessary re-renders
  const handleComplete = useCallback(() => {
    if (!hasCompletedRef.current) {
      hasCompletedRef.current = true;
      // Use setTimeout to defer the state update to avoid render-time setState
      setTimeout(() => {
        onComplete();
      }, 0);
    }
  }, [onComplete]);

  // Reset timer when key prop changes (for resetting)
  useEffect(() => {
    setTimeLeft(duration);
    hasCompletedRef.current = false;
  }, [resetKey, duration]);

  // Manage countdown interval
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isActive && timeLeft > 0 && !hasCompletedRef.current) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            handleComplete();
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, handleComplete, timeLeft]);

  const progress = (timeLeft / duration) * 100;
  const radius = (size - 12) / 2; // Account for stroke width
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        data-testid="countdown-svg"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          className="text-gray-300"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-red-500 stroke-red-500 transition-all duration-100 ease-linear"
          strokeLinecap="round"
          data-testid="countdown-progress"
          style={{
            transition: 'stroke-dashoffset 0.1s linear',
            strokeDashoffset
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-red-600">
          {Math.ceil(timeLeft)}
        </span>
      </div>
    </div>
  );
});