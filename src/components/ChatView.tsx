"use client";

import { Utterance, Feedback } from "@/types";
import ChatBubble from "./ChatBubble";

interface ChatViewProps {
  utterances: Utterance[];
  mySpeaker: string;
  feedbacks: Feedback[];
  onSaveSentence?: (feedbackId: string) => void;
  savedFeedbackIds?: Set<string>;
}

export default function ChatView({ utterances, mySpeaker, feedbacks, onSaveSentence, savedFeedbackIds }: ChatViewProps) {

  function findFeedback(utteranceText: string): Feedback | undefined {
    return feedbacks.find((fb) => {
      const original = fb.original.toLowerCase().trim();
      const uText = utteranceText.toLowerCase().trim();
      return uText.includes(original) || original.includes(uText);
    });
  }

  return (
    <div className="space-y-3">
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
