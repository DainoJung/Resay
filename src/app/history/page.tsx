"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Session, Utterance } from "@/types";
import HistoryList from "@/components/HistoryList";
import ChatView from "@/components/ChatView";
import SavedView from "@/components/history/SavedView";
import ExpressionCarousel from "@/components/history/ExpressionCarousel";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";

type MainTab = "calls" | "saved";

export default function HistoryPage() {
  return (
    <Suspense fallback={null}>
      <HistoryContent />
    </Suspense>
  );
}

function HistoryContent() {
  const searchParams = useSearchParams();
  const sessionIdParam = searchParams.get("id");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MainTab>("calls");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [savedFeedbackIds, setSavedFeedbackIds] = useState<Set<string>>(new Set());
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
      const [{ data: feedbacksData }, { data: expressionsData }] = await Promise.all([
        supabase
          .from("feedbacks")
          .select("*")
          .in("session_id", sessionIds)
          .order("created_at", { ascending: true }),
        supabase
          .from("expressions")
          .select("*")
          .in("session_id", sessionIds)
          .order("created_at", { ascending: true }),
      ]);

      const sessionsWithFeedbacks: Session[] = sessionsData.map((session) => ({
        ...session,
        utterances:
          typeof session.utterances === "string"
            ? JSON.parse(session.utterances)
            : session.utterances || [],
        feedbacks: feedbacksData?.filter((fb) => fb.session_id === session.id) || [],
        expressions: expressionsData?.filter((ex) => ex.session_id === session.id) || [],
      }));

      setSessions(sessionsWithFeedbacks);

      // Auto-select session from query param
      if (sessionIdParam) {
        const target = sessionsWithFeedbacks.find((s) => s.id === sessionIdParam);
        if (target) {
          setSelectedSession(target);
          const savedIds = new Set(
            (target.feedbacks || []).filter((fb) => fb.saved).map((fb) => fb.id)
          );
          setSavedFeedbackIds(savedIds);
        }
      }

      setLoading(false);
    }

    fetchSessions();
  }, [sessionIdParam]);

  const handleSelectSession = useCallback((session: Session) => {
    setSelectedSession(session);
    const savedIds = new Set(
      (session.feedbacks || []).filter((fb) => fb.saved).map((fb) => fb.id)
    );
    setSavedFeedbackIds(savedIds);
  }, []);

  const handleExpressionBookmark = useCallback(async (id: string, saved: boolean) => {
    await fetch("/api/bookmark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table: "expressions", id, saved }),
    });
  }, []);

  const handleSentenceBookmark = useCallback(async (feedbackId: string) => {
    const isSaved = savedFeedbackIds.has(feedbackId);
    const newSaved = !isSaved;

    setSavedFeedbackIds((prev) => {
      const next = new Set(prev);
      if (newSaved) next.add(feedbackId);
      else next.delete(feedbackId);
      return next;
    });

    await fetch("/api/bookmark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table: "feedbacks", id: feedbackId, saved: newSaved, lang }),
    });
  }, [savedFeedbackIds, lang]);

  // Detail view for a selected session
  if (selectedSession) {
    const utterances: Utterance[] = selectedSession.utterances || [];
    const mySpeaker = selectedSession.my_speaker || "A";
    const hasChat = utterances.length > 0;

    return (
      <div className="px-4 pt-6 pb-24 min-h-screen max-w-md mx-auto">
        {/* Back button */}
        <button
          onClick={() => {
            setSelectedSession(null);
            if (sessionIdParam) {
              window.history.replaceState(null, "", "/history");
            }
          }}
          className="flex items-center gap-1 text-sm text-gray-500 mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t("history.title")}
        </button>

        {/* AI Recommended Expressions */}
        {selectedSession.expressions && selectedSession.expressions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-1.5">
              <span className="text-emerald-500">&#x2728;</span>
              {t("history.detail.expressions")}
            </h2>
            <ExpressionCarousel
              expressions={selectedSession.expressions.map((ex) => ({
                id: ex.id,
                keyword: ex.keyword,
                meaning: ex.meaning,
                example: ex.example,
                highlightWord: ex.highlight_word,
                saved: ex.saved,
              }))}
              onBookmarkToggle={handleExpressionBookmark}
            />
          </div>
        )}

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
            onSaveSentence={handleSentenceBookmark}
            savedFeedbackIds={savedFeedbackIds}
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
            <HistoryList sessions={sessions} onSelect={handleSelectSession} />
          )}
        </>
      )}

      {activeTab === "saved" && <SavedView />}
    </div>
  );
}
