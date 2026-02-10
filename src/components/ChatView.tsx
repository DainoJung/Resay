"use client";

import { Utterance, Feedback } from "@/types";
import ChatBubble from "./ChatBubble";

interface ChatViewProps {
  utterances: Utterance[];
  mySpeaker: string;
  feedbacks: Feedback[];
  onSaveSentence?: (feedbackId: string) => void;
  savedFeedbackIds?: Set<string>;
  currentTimeMs?: number;
}

export default function ChatView({ utterances, mySpeaker, feedbacks, onSaveSentence, savedFeedbackIds, currentTimeMs }: ChatViewProps) {

  function findFeedback(utteranceText: string): Feedback | undefined {
    return feedbacks.find((fb) => {
      const original = fb.original.toLowerCase().trim();
      const uText = utteranceText.toLowerCase().trim();
      return uText.includes(original) || original.includes(uText);
    });
  }

  const activeIndex = currentTimeMs != null
    ? utterances.findIndex(
        (u) => u.start != null && u.end != null && currentTimeMs >= u.start && currentTimeMs < u.end
      )
    : -1;

  return (
    <div className="space-y-3">
      {utterances.map((utterance, i) => {
        const isMe = utterance.speaker === mySpeaker;
        const feedback = isMe ? findFeedback(utterance.text) : undefined;

        return (
          <div key={i}>
            <ChatBubble
              text={utterance.text}
              isMe={isMe}
              feedback={feedback}
              onSaveSentence={onSaveSentence}
              isSaved={feedback ? savedFeedbackIds?.has(feedback.id) : false}
              isActive={i === activeIndex}
            />
          </div>
        );
      })}
    </div>
  );
}
