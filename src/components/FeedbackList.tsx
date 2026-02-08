"use client";

import { Feedback } from "@/types";
import FeedbackCard from "./FeedbackCard";
import { useLanguage } from "@/lib/i18n/context";

interface FeedbackListProps {
  feedbacks: Feedback[];
  transcript: string;
}

export default function FeedbackList({ feedbacks, transcript }: FeedbackListProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      {/* Transcript summary */}
      <div className="bg-blue-50 rounded-2xl p-4">
        <p className="text-xs text-blue-400 mb-1">{t("feedbackList.myWords")}</p>
        <p className="text-sm text-blue-900 leading-relaxed">{transcript}</p>
      </div>

      {feedbacks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-gray-600 font-medium">{t("feedbackList.perfect")}</p>
          <p className="text-sm text-gray-400">{t("feedbackList.nothingToFix")}</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {feedbacks.length}{t("feedbackList.count")}
          </p>
          {feedbacks.map((fb, i) => (
            <FeedbackCard key={fb.id} feedback={fb} index={i} />
          ))}
        </>
      )}
    </div>
  );
}
