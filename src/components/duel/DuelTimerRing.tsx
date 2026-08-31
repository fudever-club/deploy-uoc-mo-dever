"use client";

import React from "react";

interface Props {
  timeLeft: number; // in seconds
  totalTime: number; // in seconds (e.g. 10 or 12)
  size?: number; // pixel diameter
  strokeWidth?: number;
}

export const DuelTimerRing: React.FC<Props> = ({
  timeLeft,
  totalTime,
  size = 64,
  strokeWidth = 6,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, timeLeft / totalTime));
  const strokeDashoffset = circumference - progress * circumference;

  // Dynamic Color Transition
  // > 5s: Neon Cyan (#4CE0D2)
  // 3-5s: Warm Amber (#FAC775)
  // <= 2s: Red Alert (#993C1D / #EF4444)
  const isUrgent = timeLeft <= 3;
  const strokeColor =
    timeLeft > 5 ? "#4CE0D2" : timeLeft > 2 ? "#FAC775" : "#EF4444";

  return (
    <div
      className={`relative flex items-center justify-center ${
        isUrgent ? "animate-pulse" : ""
      }`}
      style={{ width: size, height: size }}
    >
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Dynamic Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: "stroke-dashoffset 0.1s linear, stroke 0.3s ease",
          }}
        />
      </svg>

      {/* Center Numeric Seconds Indicator */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className={`font-mono font-black leading-none ${
            size < 50 ? "text-sm" : "text-lg"
          } ${isUrgent ? "text-red-400 scale-110" : "text-white"}`}
        >
          {Math.ceil(timeLeft)}
        </span>
        {size >= 60 && (
          <span className="text-[8px] uppercase tracking-tighter text-slate-400 font-bold">
            giây
          </span>
        )}
      </div>
    </div>
  );
};
