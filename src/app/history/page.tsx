"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Session, Utterance } from "@/types";
import HistoryList from "@/components/HistoryList";
import ChatView from "@/components/ChatView";
import AudioPlayer from "@/components/AudioPlayer";
import SavedView from "@/components/history/SavedView";
import ExpressionCarousel from "@/components/history/ExpressionCarousel";
import SpeakerSelector from "@/components/SpeakerSelector";
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
  const router = useRouter();
  const sessionIdParam = searchParams.get("id");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MainTab>("calls");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [savedFeedbackIds, setSavedFeedbackIds] = useState<Set<string>>(new Set());
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [retrySpeakerData, setRetrySpeakerData] = useState<{
    sessionId: string;
    speakers: string[];
    utterances: Utterance[];
  } | null>(null);
  const { t, lang } = useLanguage();

  const fetchSessions = useCallback(async () => {
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
      if (target && target.status !== "transcription_failed") {
        setSelectedSession(target);
        const savedIds = new Set(
          (target.feedbacks || []).filter((fb) => fb.saved).map((fb) => fb.id)
        );
        setSavedFeedbackIds(savedIds);
      }
    }

    setLoading(false);
  }, [sessionIdParam]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSelectSession = useCallback((session: Session) => {
    setSelectedSession(session);
    const savedIds = new Set(
      (session.feedbacks || []).filter((fb) => fb.saved).map((fb) => fb.id)
    );
    setSavedFeedbackIds(savedIds);
  }, []);

  const handleRetry = useCallback(async (sessionId: string) => {
    setRetryingId(sessionId);
    setRetryError(null);
    try {
      const res = await fetch("/api/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, lang }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }

      if (data.needsSpeaker) {
        setRetrySpeakerData({
          sessionId,
          speakers: data.speakers,
          utterances: data.utterances,
        });
        setRetryingId(null);
        return;
      }

      // Success - refresh and navigate to session
      await fetchSessions();
      router.push(`/history?id=${sessionId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("error.generic");
      setRetryError(msg);
    } finally {
      setRetryingId(null);
    }
  }, [lang, fetchSessions, router, t]);

  const handleRetrySpeakerSelect = useCallback(async (speaker: string) => {
    if (!retrySpeakerData) return;
    const { sessionId } = retrySpeakerData;
    setRetrySpeakerData(null);
    setRetryingId(sessionId);

    try {
      const res = await fetch("/api/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, lang, mySpeaker: speaker }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }

      await fetchSessions();
      router.push(`/history?id=${sessionId}`);
    } catch (err) {
      console.error("Retry speaker select failed:", err);
    } finally {
      setRetryingId(null);
    }
  }, [retrySpeakerData, lang, fetchSessions, router]);

  const handleDelete = useCallback(async () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);
    setSessions((prev) => prev.filter((s) => s.id !== id));

    await fetch("/api/session", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: id }),
    });
  }, [deleteTargetId]);

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

  // Speaker selection modal for retry
  if (retrySpeakerData) {
    return (
      <div className="px-4 pt-6 pb-24 min-h-screen max-w-md mx-auto flex items-center justify-center">
        <SpeakerSelector
          speakers={retrySpeakerData.speakers}
          utterances={retrySpeakerData.utterances}
          onSelect={handleRetrySpeakerSelect}
        />
      </div>
    );
  }

  // Detail view for a selected session
  if (selectedSession) {
    const utterances: Utterance[] = selectedSession.utterances || [];
    const mySpeaker = selectedSession.my_speaker || "A";
    const hasChat = utterances.length > 0;

    return (
      <div className="min-h-screen max-w-md mx-auto">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="relative flex items-center justify-center h-12">
            <button
              onClick={() => {
                setSelectedSession(null);
                setCurrentTimeMs(0);
                if (sessionIdParam) {
                  window.history.replaceState(null, "", "/history");
                }
              }}
              className="absolute left-3 flex items-center text-gray-500"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-base font-semibold text-gray-900 truncate max-w-[60%]">
              {selectedSession.title || t("history.detail.callContent")}
            </h1>
          </div>
        </div>

        <div className="px-4 pt-4 pb-24">
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

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-500">{t("history.detail.callContent")}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Audio Player - sticky below header when scrolled */}
          {selectedSession.audio_url && selectedSession.status === "completed" && (
            <div className="sticky top-12 z-[9] bg-white/80 backdrop-blur-md -mx-4 px-4 py-2 mb-4">
              <AudioPlayer
                audioUrl={selectedSession.audio_url}
                onTimeUpdate={setCurrentTimeMs}
              />
            </div>
          )}

          {/* Chat content */}
          {hasChat && selectedSession.feedbacks ? (
            <ChatView
              utterances={utterances}
              mySpeaker={mySpeaker}
              feedbacks={selectedSession.feedbacks}
              onSaveSentence={handleSentenceBookmark}
              savedFeedbackIds={savedFeedbackIds}
              currentTimeMs={selectedSession.audio_url ? currentTimeMs : undefined}
            />
          ) : selectedSession.feedbacks && selectedSession.feedbacks.length > 0 ? (
            <div className="space-y-3">
              {selectedSession.feedbacks.map((fb, i) => (
                <div key={fb.id} className="bg-gray-50 rounded-xl p-4 space-y-1">
                  <p className="text-xs text-gray-500">#{i + 1}</p>
                  <p className="text-sm text-gray-500 line-through">{fb.original}</p>
                  <p className="text-sm text-gray-900 font-medium">{fb.paraphrase}</p>
                  <p className="text-xs text-gray-500">{fb.explanation}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">{t("history.noCorrections")}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="relative flex items-center justify-center h-12">
          <Link
            href="/"
            className="absolute left-3 flex items-center text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-base font-semibold text-gray-900">{t("history.title")}</h1>
        </div>

        {/* Tab Bar inside sticky header */}
        <div className="flex px-4">
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
      </div>

      <div className="px-4 pt-4 pb-24">
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
              <>
                {retryError && (
                  <div className="bg-red-50 text-red-700 text-sm rounded-xl p-4 mb-4">
                    {retryError}
                  </div>
                )}
                <HistoryList
                  sessions={sessions}
                  onSelect={handleSelectSession}
                  onRetry={handleRetry}
                  onDelete={(id) => setDeleteTargetId(id)}
                  retryingId={retryingId}
                />
              </>
            )}
          </>
        )}

        {activeTab === "saved" && <SavedView />}
      </div>

      {/* Delete confirmation dialog */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl">
            <p className="text-base font-semibold text-gray-900 text-center mb-2">
              {t("history.deleteConfirm")}
            </p>
            <p className="text-sm text-gray-500 text-center mb-6">
              {t("history.deleteConfirmDesc")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {t("history.cancel")}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                {t("history.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
