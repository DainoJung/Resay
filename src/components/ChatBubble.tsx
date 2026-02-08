"use client";

import { Feedback } from "@/types";
import { useLanguage } from "@/lib/i18n/context";
import { TranslationKey } from "@/lib/i18n/translations";

const categoryKeys: Record<string, { labelKey: TranslationKey; color: string }> = {
  grammar: { labelKey: "category.grammar", color: "bg-red-400/20 text-red-300" },
  vocabulary: { labelKey: "category.vocabulary", color: "bg-blue-400/20 text-blue-300" },
  expression: { labelKey: "category.expression", color: "bg-purple-400/20 text-purple-300" },
  pronunciation: { labelKey: "category.pronunciation", color: "bg-green-400/20 text-green-300" },
};

interface ChatBubbleProps {
  text: string;
  isMe: boolean;
  feedback?: Feedback;
}

export default function ChatBubble({ text, isMe, feedback }: ChatBubbleProps) {
  const { t } = useLanguage();

  if (!isMe) {
    // Other speaker: left-aligned white bubble
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-100">
          <p className="text-[15px] text-gray-800 leading-relaxed">{text}</p>
        </div>
      </div>
    );
  }

  // My bubble: right-aligned
  return (
    <div className="flex flex-col items-end gap-1.5">
      {/* Original speech bubble */}
      <div className="max-w-[85%] bg-blue-500 rounded-2xl rounded-tr-md px-4 py-3">
        <p className="text-[15px] text-white leading-relaxed">{text}</p>
      </div>

      {/* Correction card (dark) - only if there's feedback */}
      {feedback && (
        <div className="max-w-[85%] bg-gray-900 rounded-2xl px-4 py-3 space-y-2">
          {feedback.category && categoryKeys[feedback.category] && (
            <span
              className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-medium ${
                categoryKeys[feedback.category].color
              }`}
            >
              {t(categoryKeys[feedback.category].labelKey)}
            </span>
          )}
          <p className="text-[15px] text-white font-medium leading-relaxed">
            {feedback.paraphrase}
          </p>
          <p className="text-[13px] text-gray-400 leading-relaxed">
            {feedback.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
