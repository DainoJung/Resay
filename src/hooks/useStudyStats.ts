"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth/context";

interface StudyStats {
  streak: number;
  weeklyMinutes: number;
  todaySeconds: number;
  loading: boolean;
  refreshTodaySeconds: () => Promise<void>;
}

export function useStudyStats(): StudyStats {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [todaySeconds, setTodaySeconds] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      try {
        // 1) 연속 학습 일수: 날짜별 세션 존재 여부로 계산
        const { data: sessions } = await supabase
          .from("sessions")
          .select("created_at")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("created_at", { ascending: false });

        if (sessions && sessions.length > 0) {
          const daySet = new Set(
            sessions.map((s) =>
              new Date(s.created_at).toLocaleDateString("en-CA") // YYYY-MM-DD
            )
          );
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          let count = 0;
          const check = new Date(today);

          // 오늘 기록이 없으면 어제부터 체크
          const todayStr = check.toLocaleDateString("en-CA");
          if (!daySet.has(todayStr)) {
            check.setDate(check.getDate() - 1);
          }

          while (daySet.has(check.toLocaleDateString("en-CA"))) {
            count++;
            check.setDate(check.getDate() - 1);
          }
          setStreak(count);
        }

        // 2) 이번 주 녹음 시간
        const now = new Date();
        const monday = new Date(now);
        const day = monday.getDay();
        monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
        monday.setHours(0, 0, 0, 0);

        const { data: weekSessions } = await supabase
          .from("sessions")
          .select("duration")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .gte("created_at", monday.toISOString());

        if (weekSessions) {
          const totalSeconds = weekSessions.reduce(
            (sum, s) => sum + (s.duration || 0),
            0
          );
          setWeeklyMinutes(Math.round(totalSeconds / 60));
        }

        // 3) 오늘 녹음 시간 (초)
        await fetchTodaySeconds();
      } catch {
        // 실패 시 기본값 유지
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [user]);

  const fetchTodaySeconds = useCallback(async () => {
    if (!user) return;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("sessions")
      .select("duration")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .gte("created_at", todayStart.toISOString());

    if (data) {
      setTodaySeconds(data.reduce((sum, s) => sum + (s.duration || 0), 0));
    }
  }, [user]);

  return { streak, weeklyMinutes, todaySeconds, loading, refreshTodaySeconds: fetchTodaySeconds };
}
