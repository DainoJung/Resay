"use client";

import { useState } from "react";
import { Session } from "@/types";
import FeedbackCard from "./FeedbackCard";

interface HistoryItemProps {
  session: Session;
}

export default function HistoryItem({ session }: HistoryItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const date = new Date(session.created_at);
  const dateStr = date.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const previewText =
    session.transcript.length > 80
      ? session.transcript.slice(0, 80) + "..."
      : session.transcript;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 flex items-start justify-between gap-3"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 leading-relaxed">{previewText}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-400">{dateStr}</span>
            {session.feedback_count > 0 && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                {session.feedback_count}개 피드백
              </span>
            )}
            {session.feedback_count === 0 && (
              <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                완벽!
              </span>
            )}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && session.feedbacks && session.feedbacks.length > 0 && (
        <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50">
          {session.feedbacks.map((fb, i) => (
            <FeedbackCard key={fb.id} feedback={fb} index={i} />
          ))}
        </div>
      )}

      {isOpen && (!session.feedbacks || session.feedbacks.length === 0) && (
        <div className="border-t border-gray-100 p-6 text-center bg-gray-50">
          <p className="text-sm text-gray-500">교정할 부분이 없었습니다.</p>
        </div>
      )}
    </div>
  );
}
