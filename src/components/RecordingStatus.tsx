"use client";

interface RecordingStatusProps {
  isRecording: boolean;
  duration: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function RecordingStatus({ isRecording, duration }: RecordingStatusProps) {
  if (!isRecording && duration === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      {isRecording && (
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      )}
      <span className={isRecording ? "text-red-500 font-medium" : "text-gray-500"}>
        {formatTime(duration)}
      </span>
    </div>
  );
}
