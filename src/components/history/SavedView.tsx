"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import ExpressionCard from "./ExpressionCard";
import SentenceCard from "./SentenceCard";
import EmptyState from "@/components/EmptyState";

const mockExpressions = [
  {
    keyword: "come in handy",
    meaning: "유용하게 쓰이다",
    example: "This tool will come in handy when you need to fix things.",
    highlightWord: "come in handy",
  },
  {
    keyword: "pros and cons",
    meaning: "장단점",
    example: "Let's weigh the pros and cons before making a decision.",
    highlightWord: "pros and cons",
  },
  {
    keyword: "get the hang of",
    meaning: "요령을 터득하다",
    example: "You'll get the hang of it after a few tries.",
    highlightWord: "get the hang of",
  },
];

const mockSentences = [
  {
    english: "I think we should take a different approach.",
    korean: "다른 접근 방식을 취해야 할 것 같아요.",
  },
  {
    english: "Could you elaborate on that point?",
    korean: "그 점에 대해 좀 더 자세히 설명해 주시겠어요?",
  },
  {
    english: "Let me get back to you on that.",
    korean: "그건 나중에 다시 알려드릴게요.",
  },
];

type SubTab = "expressions" | "sentences";

export default function SavedView() {
  const [subTab, setSubTab] = useState<SubTab>("expressions");
  const { t } = useLanguage();

  const showEmpty = false; // Toggle for empty state testing

  if (showEmpty) {
    return (
      <EmptyState
        title={t("history.saved.empty")}
        description=""
      />
    );
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSubTab("expressions")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            subTab === "expressions"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {t("history.saved.expressions")}
        </button>
        <button
          onClick={() => setSubTab("sentences")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            subTab === "sentences"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {t("history.saved.sentences")}
        </button>
      </div>

      {subTab === "expressions" && (
        <div className="space-y-3">
          {mockExpressions.map((expr) => (
            <ExpressionCard key={expr.keyword} {...expr} />
          ))}
        </div>
      )}

      {subTab === "sentences" && (
        <div className="space-y-3">
          {mockSentences.map((sent) => (
            <SentenceCard key={sent.english} {...sent} />
          ))}
        </div>
      )}
    </div>
  );
}
