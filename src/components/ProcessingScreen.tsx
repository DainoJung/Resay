"use client";

import { useState, useEffect, useRef } from "react";

interface ProcessingScreenProps {
  stage: "transcribing" | "analyzing";
  stageLabel: string;
}

export default function ProcessingScreen({ stage, stageLabel }: ProcessingScreenProps) {
  const [percent, setPercent] = useState(0);
  const prevStageRef = useRef(stage);

  useEffect(() => {
    // When stage changes to analyzing, jump to 50%
    if (stage === "analyzing" && prevStageRef.current === "transcribing") {
      setPercent(50);
    }
    prevStageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    const target = stage === "transcribing" ? 48 : 95;
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= target) return prev;
        // Slow down as approaching target
        const remaining = target - prev;
        const step = Math.max(0.3, remaining * 0.04);
        return Math.min(prev + step, target);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [stage]);

  return (
    <div className="flex flex-col items-center gap-6 mt-20">
      {/* Wave animation */}
      <div className="flex items-end gap-1 h-16">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="w-1 rounded-full bg-blue-400"
            style={{
              animation: `wave 1.2s ease-in-out ${i * 0.1}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Percentage */}
      <span className="text-4xl font-bold text-gray-900 tabular-nums">
        {Math.floor(percent)}%
      </span>

      {/* Stage label */}
      <p className="text-sm text-gray-500">{stageLabel}</p>

      {/* Step dots */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${stage === "transcribing" ? "bg-blue-400 animate-pulse" : "bg-blue-400"}`} />
        <div className="w-6 h-px bg-gray-300" />
        <div className={`w-2 h-2 rounded-full ${stage === "analyzing" ? "bg-blue-400 animate-pulse" : "bg-gray-300"}`} />
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { height: 12px; opacity: 0.4; }
          50% { height: 48px; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
