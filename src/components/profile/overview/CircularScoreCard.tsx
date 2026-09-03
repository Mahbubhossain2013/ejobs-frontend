"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface Props {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export default function CircularScoreCard({ score, size = 120, strokeWidth = 8 }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 70) return { stroke: "#10b981", text: "text-emerald-600" };
    if (s >= 40) return { stroke: "#f59e0b", text: "text-amber-600" };
    return { stroke: "#ef4444", text: "text-red-600" };
  };
  const colors = getColor(score);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="hsl(var(--muted))"
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={colors.stroke}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="text-lg font-bold fill-foreground"
        transform={`rotate(90 ${size / 2} ${size / 2})`}
      >
        {score}%
      </text>
    </svg>
  );
}