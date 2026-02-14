"use client";

interface SemiCircularGaugeProps {
  score: number;
  grade: string;
}

export default function SemiCircularGauge({ score, grade }: SemiCircularGaugeProps) {
  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2 + 10;

  // Semi-circle from 180° to 0° (left to right, top half)
  const circumference = Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100) / 100;
  const dashOffset = circumference * (1 - progress);

  const arcPath = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;

  const gradeColor =
    score >= 90 ? "text-emerald-500" :
    score >= 75 ? "text-emerald-500" :
    score >= 60 ? "text-yellow-500" :
    score >= 40 ? "text-orange-500" :
    "text-red-400";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="30%" stopColor="#fbbf24" />
            <stop offset="60%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* Background arc */}
        <path
          d={arcPath}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Progress arc */}
        <path
          d={arcPath}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />

        {/* Score text */}
        <text
          x={cx}
          y={cy - 20}
          textAnchor="middle"
          className="fill-gray-900"
          fontSize="40"
          fontWeight="700"
        >
          {score}
        </text>
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          className="fill-gray-400"
          fontSize="14"
        >
          / 100
        </text>
      </svg>

      <span className={`-mt-1 text-sm font-semibold ${gradeColor} bg-gray-50 px-3 py-1 rounded-full`}>
        {grade}
      </span>
    </div>
  );
}
