"use client";

import { Utterance, Feedback } from "@/types";
import ChatBubble from "./ChatBubble";
import { useLanguage } from "@/lib/i18n/context";

interface ChatViewProps {
  utterances: Utterance[];
  mySpeaker: string;
  feedbacks: Feedback[];
}

export default function ChatView({ utterances, mySpeaker, feedbacks }: ChatViewProps) {
  const { t } = useLanguage();

  // Match feedback to utterance by finding which utterance contains the original text
  function findFeedback(utteranceText: string): Feedback | undefined {
    return feedbacks.find((fb) => {
      const original = fb.original.toLowerCase().trim();
      const uText = utteranceText.toLowerCase().trim();
      return uText.includes(original) || original.includes(uText);
    });
  }

  const hasFeedback = feedbacks.length > 0;

  return (
    <div className="space-y-3">
      {hasFeedback ? (
        <p className="text-sm text-gray-500 text-center">
          {feedbacks.length}{t("chat.correctionsCount")}
        </p>
      ) : (
        <div className="text-center py-4">
          <p className="text-2xl mb-1">🎉</p>
          <p className="text-sm text-gray-600 font-medium">{t("chat.perfect")}</p>
        </div>
      )}

      {utterances.map((utterance, i) => {
        const isMe = utterance.speaker === mySpeaker;
        const feedback = isMe ? findFeedback(utterance.text) : undefined;

        return (
          <ChatBubble
            key={i}
            text={utterance.text}
            isMe={isMe}
            feedback={feedback}
          />
        );
      })}
    </div>
  );
}
