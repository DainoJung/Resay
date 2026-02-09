"use client";

import { Utterance, Feedback } from "@/types";
import ChatBubble from "./ChatBubble";
import { useLanguage } from "@/lib/i18n/context";

interface ChatViewProps {
  utterances: Utterance[];
  mySpeaker: string;
  feedbacks: Feedback[];
  onSaveSentence?: (feedbackId: string) => void;
  savedFeedbackIds?: Set<string>;
}

export default function ChatView({ utterances, mySpeaker, feedbacks, onSaveSentence, savedFeedbackIds }: ChatViewProps) {
  const { t } = useLanguage();

  function findFeedback(utteranceText: string): Feedback | undefined {
    return feedbacks.find((fb) => {
      const original = fb.original.toLowerCase().trim();
      const uText = utteranceText.toLowerCase().trim();
      return uText.includes(original) || original.includes(uText);
    });
  }

  const corrections = feedbacks.filter((fb) => !fb.is_perfect);

  return (
    <div className="space-y-3">
      {corrections.length > 0 ? (
        <p className="text-sm text-gray-500 text-center">
          {corrections.length}{t("chat.correctionsCount")}
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
            onSaveSentence={onSaveSentence}
            isSaved={feedback ? savedFeedbackIds?.has(feedback.id) : false}
          />
        );
      })}
    </div>
  );
}
