"use client";

import { Session } from "@/types";
import { useLanguage } from "@/lib/i18n/context";

interface HistoryItemProps {
  session: Session;
  onSelect: (session: Session) => void;
  onRetry?: (sessionId: string) => void;
  onDelete?: (sessionId: string) => void;
  isRetrying?: boolean;
}

function formatDuration(seconds: number, lang: string): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (lang === "ja") {
    if (m > 0) return s > 0 ? `${m}分 ${s}秒` : `${m}分`;
    return `${s}秒`;
  }
  if (m > 0) return s > 0 ? `${m}분 ${s}초` : `${m}분`;
  return `${s}초`;
}

export default function HistoryItem({ session, onSelect, onRetry, onDelete, isRetrying }: HistoryItemProps) {
  const { t, lang } = useLanguage();
  const isFailed = session.status === "transcription_failed";

  const date = new Date(session.created_at);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const dateStr = `${y}.${m}.${d}`;

  const title = isFailed
    ? t("history.transcriptionFailed")
    : session.title
      || (session.transcript.length > 30
        ? session.transcript.slice(0, 30) + "..."
        : session.transcript);

  const durationStr = session.duration
    ? formatDuration(session.duration, lang)
    : null;

  const deleteButton = onDelete && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete(session.id);
      }}
      className="flex-shrink-0 p-2 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    </button>
  );

  if (isFailed) {
    return (
      <div className="group w-full flex items-center py-5 border-b border-gray-100 gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
            <p className="text-base font-bold text-red-500">{title}</p>
          </div>
          <p className="text-sm text-gray-400">
            {dateStr}
            {durationStr && <span>  ·  {durationStr}</span>}
          </p>
        </div>
        {onRetry && session.audio_url && (
          <button
            onClick={() => onRetry(session.id)}
            disabled={isRetrying}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRetrying ? t("history.retrying") : t("history.retry")}
          </button>
        )}
        {deleteButton}
      </div>
    );
  }

  return (
    <div className="group w-full flex items-center py-5 border-b border-gray-100 gap-2">
      <button
        onClick={() => onSelect(session)}
        className="flex-1 min-w-0 text-left"
      >
        <p className="text-base font-bold text-gray-900 mb-2">{title}</p>
        <p className="text-sm text-gray-400">
          {dateStr}
          {durationStr && <span>  ·  {durationStr}</span>}
        </p>
      </button>
      {deleteButton}
    </div>
  );
}
