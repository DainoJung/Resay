"use client";

import { ReactNode } from "react";

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  score: number;
}

export default function MetricCard({ icon, label, score }: MetricCardProps) {
  const barColor =
    score >= 75 ? "bg-emerald-400" :
    score >= 60 ? "bg-yellow-400" :
    score >= 40 ? "bg-orange-400" :
    "bg-red-400";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-900">{score}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{
            width: `${Math.min(Math.max(score, 0), 100)}%`,
            transition: "width 1s ease-out",
          }}
        />
      </div>
    </div>
  );
}
