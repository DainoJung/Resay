"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@/types";
import HistoryList from "@/components/HistoryList";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Fetch feedbacks for each session
      const sessionIds = sessionsData.map((s) => s.id);
      const { data: feedbacksData } = await supabase
        .from("feedbacks")
        .select("*")
        .in("session_id", sessionIds)
        .order("created_at", { ascending: true });

      const sessionsWithFeedbacks: Session[] = sessionsData.map((session) => ({
        ...session,
        feedbacks: feedbacksData?.filter((fb) => fb.session_id === session.id) || [],
      }));

      setSessions(sessionsWithFeedbacks);
      setLoading(false);
    }

    fetchSessions();
  }, []);

  return (
    <div className="px-4 pt-8 pb-24 min-h-screen max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">기록</h1>
      <p className="text-sm text-gray-400 mb-6">지난 피드백을 다시 확인하세요</p>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
      ) : (
        <HistoryList sessions={sessions} />
      )}
    </div>
  );
}
