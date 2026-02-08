"use client";

import { useState } from "react";
import { Session, Utterance } from "@/types";
import ChatView from "./ChatView";
import { useLanguage } from "@/lib/i18n/context";

interface HistoryItemProps {
  session: Session;
}

export default function HistoryItem({ session }: HistoryItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t, lang } = useLanguage();

  const date = new Date(session.created_at);
  const dateLocale = lang === "ja" ? "ja-JP" : "ko-KR";
  const dateStr = date.toLocaleDateString(dateLocale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const previewText =
    session.transcript.length > 80
      ? session.transcript.slice(0, 80) + "..."
      : session.transcript;

  const utterances: Utterance[] = session.utterances || [];
  const mySpeaker = session.my_speaker || "A";
  const hasChat = utterances.length > 0;

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
                {session.feedback_count}{t("history.feedbackCount")}
              </span>
            )}
            {session.feedback_count === 0 && (
              <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                {t("history.perfect")}
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

      {isOpen && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          {hasChat && session.feedbacks ? (
            <ChatView
              utterances={utterances}
              mySpeaker={mySpeaker}
              feedbacks={session.feedbacks}
            />
          ) : session.feedbacks && session.feedbacks.length > 0 ? (
            // Fallback for old sessions without utterances
            <div className="space-y-3">
              {session.feedbacks.map((fb, i) => (
                <div key={fb.id} className="bg-white rounded-xl p-3 space-y-1">
                  <p className="text-xs text-gray-400">#{i + 1}</p>
                  <p className="text-sm text-gray-600 line-through">{fb.original}</p>
                  <p className="text-sm text-gray-900 font-medium">{fb.paraphrase}</p>
                  <p className="text-xs text-gray-500">{fb.explanation}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">{t("history.noCorrections")}</p>
          )}
        </div>
      )}
    </div>
  );
}
