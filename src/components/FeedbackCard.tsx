"use client";

import { Feedback } from "@/types";

const categoryLabels: Record<string, { label: string; color: string }> = {
  grammar: { label: "문법", color: "bg-red-100 text-red-700" },
  vocabulary: { label: "어휘", color: "bg-blue-100 text-blue-700" },
  expression: { label: "표현", color: "bg-purple-100 text-purple-700" },
  pronunciation: { label: "발음", color: "bg-green-100 text-green-700" },
};

interface FeedbackCardProps {
  feedback: Feedback;
  index: number;
}

export default function FeedbackCard({ feedback, index }: FeedbackCardProps) {
  const cat = feedback.category ? categoryLabels[feedback.category] : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 font-medium">#{index + 1}</span>
        {cat && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.color}`}>
            {cat.label}
          </span>
        )}
      </div>

      {/* Original */}
      <div>
        <p className="text-xs text-gray-400 mb-1">원문</p>
        <p className="text-gray-600 line-through decoration-red-300">{feedback.original}</p>
      </div>

      {/* Paraphrase */}
      <div>
        <p className="text-xs text-gray-400 mb-1">교정</p>
        <p className="text-gray-900 font-medium">{feedback.paraphrase}</p>
      </div>

      {/* Explanation */}
      <div className="bg-gray-50 rounded-xl p-3">
        <p className="text-sm text-gray-600 leading-relaxed">{feedback.explanation}</p>
      </div>
    </div>
  );
}
