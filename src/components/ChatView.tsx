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

function formatTimestamp(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
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
            {utterance.start != null && currentTimeMs != null && (
              <p className="text-[11px] text-gray-400 mb-1 ml-1">{formatTimestamp(utterance.start)}</p>
            )}
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
