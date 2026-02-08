"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/i18n/context";
import ExpressionCard from "./ExpressionCard";
import SentenceCard from "./SentenceCard";
import EmptyState from "@/components/EmptyState";

interface SavedExpression {
  id: string;
  keyword: string;
  meaning: string;
  example: string;
  highlight_word: string;
}

interface SavedSentence {
  id: string;
  english: string;
  korean: string;
}

type SubTab = "expressions" | "sentences";

export default function SavedView() {
  const [subTab, setSubTab] = useState<SubTab>("expressions");
  const [expressions, setExpressions] = useState<SavedExpression[]>([]);
  const [sentences, setSentences] = useState<SavedSentence[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    async function fetchSaved() {
      const [{ data: expData }, { data: fbData }] = await Promise.all([
        supabase
          .from("expressions")
          .select("id, keyword, meaning, example, highlight_word")
          .eq("saved", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("feedbacks")
          .select("id, paraphrase, explanation")
          .eq("saved", true)
          .order("created_at", { ascending: false }),
      ]);

      setExpressions(expData || []);
      setSentences(
        (fbData || []).map((fb) => ({
          id: fb.id,
          english: fb.paraphrase,
          korean: fb.explanation,
        }))
      );
      setLoading(false);
    }

    fetchSaved();
  }, []);

  const handleExpressionUnbookmark = useCallback(async (id: string) => {
    setExpressions((prev) => prev.filter((e) => e.id !== id));
    await fetch("/api/bookmark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table: "expressions", id, saved: false }),
    });
  }, []);

  const handleSentenceUnbookmark = useCallback(async (id: string) => {
    setSentences((prev) => prev.filter((s) => s.id !== id));
    await fetch("/api/bookmark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table: "feedbacks", id, saved: false }),
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-2xl h-24" />
        ))}
      </div>
    );
  }

  const isEmpty = expressions.length === 0 && sentences.length === 0;
  if (isEmpty) {
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
          {expressions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">{t("history.saved.empty")}</p>
          ) : (
            expressions.map((expr) => (
              <ExpressionCard
                key={expr.id}
                id={expr.id}
                keyword={expr.keyword}
                meaning={expr.meaning}
                example={expr.example}
                highlightWord={expr.highlight_word}
                bookmarked={true}
                onBookmarkToggle={(id) => handleExpressionUnbookmark(id)}
              />
            ))
          )}
        </div>
      )}

      {subTab === "sentences" && (
        <div className="space-y-3">
          {sentences.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">{t("history.saved.empty")}</p>
          ) : (
            sentences.map((sent) => (
              <SentenceCard
                key={sent.id}
                id={sent.id}
                english={sent.english}
                korean={sent.korean}
                bookmarked={true}
                onBookmarkToggle={(id) => handleSentenceUnbookmark(id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
