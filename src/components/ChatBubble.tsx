"use client";

import { useRef, useEffect } from "react";
import { Feedback } from "@/types";

interface ChatBubbleProps {
  text: string;
  isMe: boolean;
  feedback?: Feedback;
  onSaveSentence?: (feedbackId: string) => void;
  isSaved?: boolean;
  isActive?: boolean;
}

export default function ChatBubble({ text, isMe, feedback, onSaveSentence, isSaved, isActive }: ChatBubbleProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isActive]);

  if (!isMe) {
    return (
      <div ref={ref} className={`-mx-4 px-4 py-1.5 rounded-xl transition-all duration-200 ${isActive ? "bg-blue-100" : ""
        }`}>
        <div className="flex justify-start">
          <div className="max-w-[85%] bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-100">
            <p className="text-[15px] text-gray-800 leading-relaxed">{text}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={`-mx-4 px-4 py-1.5 rounded-xl transition-all duration-200 ${isActive ? "bg-blue-100" : ""
      }`}>
      <div className="flex flex-col items-end gap-1.5">
        <div className="max-w-[85%] bg-blue-500 rounded-2xl rounded-tr-md px-4 py-3">
          <p className="text-[15px] text-white leading-relaxed">{text}</p>
        </div>

        {feedback && (
          <div className="relative max-w-[85%]">
            {/* Status icon - floating top-right outside the card */}
            <div className="absolute -top-2 -right-2 z-10">
              {feedback.is_perfect ? (
                <span className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z" />
                  </svg>
                </span>
              ) : (
                <span className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shadow-md">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
              )}
            </div>

            {/* Feedback card */}
            <div className={`rounded-2xl px-4 py-3 space-y-2 ${feedback.is_perfect
              ? "bg-emerald-50 border border-emerald-200"
              : "bg-gray-900"
              }`}>
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <p className={`text-[15px] font-medium leading-relaxed ${feedback.is_perfect ? "text-gray-800" : "text-white"
                    }`}>
                    {feedback.paraphrase}
                  </p>
                  <p className={`text-[13px] leading-relaxed ${feedback.is_perfect ? "text-gray-500" : "text-gray-400"
                    }`}>
                    {feedback.explanation}
                  </p>
                </div>
                {onSaveSentence && (
                  <button
                    onClick={() => onSaveSentence(feedback.id)}
                    className={`flex-shrink-0 mt-0.5 transition-colors ${isSaved ? "text-emerald-400" : (feedback.is_perfect ? "text-gray-400 hover:text-emerald-500" : "text-gray-500 hover:text-emerald-400")
                      }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill={isSaved ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={isSaved ? 0 : 2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
