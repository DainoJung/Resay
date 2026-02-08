"use client";

import { Session } from "@/types";
import { useLanguage } from "@/lib/i18n/context";

interface HistoryItemProps {
  session: Session;
  onSelect: (session: Session) => void;
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

export default function HistoryItem({ session, onSelect }: HistoryItemProps) {
  const { lang } = useLanguage();

  const date = new Date(session.created_at);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const dateStr = `${y}.${m}.${d}`;

  const title =
    session.transcript.length > 30
      ? session.transcript.slice(0, 30) + "..."
      : session.transcript;

  const durationStr = session.duration
    ? formatDuration(session.duration, lang)
    : null;

  return (
    <button
      onClick={() => onSelect(session)}
      className="w-full text-left py-5 border-b border-gray-100"
    >
      <p className="text-base font-bold text-gray-900 mb-2">{title}</p>
      <p className="text-sm text-gray-400">
        {dateStr}
        {durationStr && <span>  ·  {durationStr}</span>}
      </p>
    </button>
  );
}
