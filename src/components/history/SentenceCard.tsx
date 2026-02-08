"use client";

import { useState } from "react";

interface SentenceCardProps {
  english: string;
  korean: string;
  bookmarked?: boolean;
}

export default function SentenceCard({
  english,
  korean,
  bookmarked: initialBookmarked = false,
}: SentenceCardProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-start gap-2 mb-1">
        <p className="text-base font-bold text-gray-900 flex-1">{english}</p>
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className="text-gray-400 hover:text-emerald-500 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill={bookmarked ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={bookmarked ? 0 : 2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-500">{korean}</p>
    </div>
  );
}
