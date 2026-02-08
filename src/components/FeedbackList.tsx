"use client";

import { Feedback } from "@/types";
import FeedbackCard from "./FeedbackCard";

interface FeedbackListProps {
  feedbacks: Feedback[];
  transcript: string;
}

export default function FeedbackList({ feedbacks, transcript }: FeedbackListProps) {
  return (
    <div className="space-y-4">
      {/* Transcript summary */}
      <div className="bg-blue-50 rounded-2xl p-4">
        <p className="text-xs text-blue-400 mb-1">내가 말한 내용</p>
        <p className="text-sm text-blue-900 leading-relaxed">{transcript}</p>
      </div>

      {feedbacks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-gray-600 font-medium">완벽해요!</p>
          <p className="text-sm text-gray-400">교정할 부분이 없습니다.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {feedbacks.length}개의 피드백
          </p>
          {feedbacks.map((fb, i) => (
            <FeedbackCard key={fb.id} feedback={fb} index={i} />
          ))}
        </>
      )}
    </div>
  );
}
