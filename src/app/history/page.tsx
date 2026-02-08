"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session, Utterance } from "@/types";
import HistoryList from "@/components/HistoryList";
import ChatView from "@/components/ChatView";
import SavedView from "@/components/history/SavedView";
import ExpressionCarousel from "@/components/history/ExpressionCarousel";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";

const mockDetailExpressions = [
  {
    keyword: "AI feedback loop",
    meaning: "AI 피드백 루프",
    example: "My service also includes an AI feedback loop.",
    highlightWord: "AI feedback loop",
  },
  {
    keyword: "come in handy",
    meaning: "유용하게 쓰이다",
    example: "This tool will come in handy when you need to fix things.",
    highlightWord: "come in handy",
  },
  {
    keyword: "get the hang of",
    meaning: "요령을 터득하다",
    example: "You'll get the hang of it after a few tries.",
    highlightWord: "get the hang of",
  },
  {
    keyword: "pros and cons",
    meaning: "장단점",
    example: "Let's weigh the pros and cons before making a decision.",
    highlightWord: "pros and cons",
  },
  {
    keyword: "take a different approach",
    meaning: "다른 접근 방식을 취하다",
    example: "I think we should take a different approach to this problem.",
    highlightWord: "take a different approach",
  },
];

type MainTab = "calls" | "saved";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MainTab>("calls");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const { t, lang } = useLanguage();

  useEffect(() => {
    async function fetchSessions() {
      const { data: sessionsData } = await supabase
        .from("sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!sessionsData) {
        setLoading(false);
        return;
      }

      const sessionIds = sessionsData.map((s) => s.id);
      const { data: feedbacksData } = await supabase
        .from("feedbacks")
        .select("*")
        .in("session_id", sessionIds)
        .order("created_at", { ascending: true });

      const sessionsWithFeedbacks: Session[] = sessionsData.map((session) => ({
        ...session,
        utterances:
          typeof session.utterances === "string"
            ? JSON.parse(session.utterances)
            : session.utterances || [],
        feedbacks: feedbacksData?.filter((fb) => fb.session_id === session.id) || [],
      }));

      setSessions(sessionsWithFeedbacks);
      setLoading(false);
    }

    fetchSessions();
  }, []);

  // Detail view for a selected session
  if (selectedSession) {
    const utterances: Utterance[] = selectedSession.utterances || [];
    const mySpeaker = selectedSession.my_speaker || "A";
    const hasChat = utterances.length > 0;

    return (
      <div className="px-4 pt-6 pb-24 min-h-screen max-w-md mx-auto">
        {/* Back button */}
        <button
          onClick={() => setSelectedSession(null)}
          className="flex items-center gap-1 text-sm text-gray-500 mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t("history.title")}
        </button>

        {/* AI Recommended Expressions */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-1.5">
            <span className="text-emerald-500">&#x2728;</span>
            {t("history.detail.expressions")}
          </h2>
          <ExpressionCarousel expressions={mockDetailExpressions} />
        </div>

        {/* Divider: 통화 내용 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400">{t("history.detail.callContent")}</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Chat content */}
        {hasChat && selectedSession.feedbacks ? (
          <ChatView
            utterances={utterances}
            mySpeaker={mySpeaker}
            feedbacks={selectedSession.feedbacks}
          />
        ) : selectedSession.feedbacks && selectedSession.feedbacks.length > 0 ? (
          <div className="space-y-3">
            {selectedSession.feedbacks.map((fb, i) => (
              <div key={fb.id} className="bg-gray-50 rounded-xl p-3 space-y-1">
                <p className="text-xs text-gray-400">#{i + 1}</p>
                <p className="text-sm text-gray-600 line-through">{fb.original}</p>
                <p className="text-sm text-gray-900 font-medium">{fb.paraphrase}</p>
                <p className="text-xs text-gray-500">{fb.explanation}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">{t("history.noCorrections")}</p>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24 min-h-screen max-w-md mx-auto">
      <Link
        href="/"
        className="flex items-center gap-1 text-sm text-gray-500 mb-4"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </Link>

      {/* Main Tab Bar */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("calls")}
          className={`flex-1 pb-3 text-sm font-medium text-center transition-colors relative ${activeTab === "calls"
              ? "text-gray-900"
              : "text-gray-400 hover:text-gray-600"
            }`}
        >
          {t("history.tab.calls")}
          {activeTab === "calls" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`flex-1 pb-3 text-sm font-medium text-center transition-colors relative ${activeTab === "saved"
              ? "text-gray-900"
              : "text-gray-400 hover:text-gray-600"
            }`}
        >
          {t("history.tab.saved")}
          {activeTab === "saved" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "calls" && (
        <>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <HistoryList sessions={sessions} onSelect={setSelectedSession} />
          )}
        </>
      )}

      {activeTab === "saved" && <SavedView />}
    </div>
  );
}
