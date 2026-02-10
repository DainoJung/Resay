"use client";

interface RecordButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStart: () => void;
  onStop: () => void;
}

export default function RecordButton({
  isRecording,
  isProcessing,
  onStart,
  onStop,
}: RecordButtonProps) {
  return (
    <button
      onClick={isRecording ? onStop : onStart}
      disabled={isProcessing}
      className={`
        relative w-20 h-20 rounded-full transition-all duration-300
        flex items-center justify-center
        ${isProcessing
          ? "bg-gray-300 cursor-not-allowed"
          : isRecording
            ? "bg-red-500 shadow-lg shadow-red-500/30 ring-[6px] ring-red-500/20"
            : "bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 ring-[6px] ring-emerald-800/20"
        }
      `}
    >
      {isRecording && (
        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
      )}
      <span className="relative z-10">
        {isProcessing ? (
          <svg className="w-9 h-9 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : isRecording ? (
          <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}
      </span>
    </button>
  );
}
