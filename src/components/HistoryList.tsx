"use client";

import { Session } from "@/types";
import HistoryItem from "./HistoryItem";
import EmptyState from "./EmptyState";

interface HistoryListProps {
  sessions: Session[];
}

export default function HistoryList({ sessions }: HistoryListProps) {
  if (sessions.length === 0) {
    return (
      <EmptyState
        title="아직 기록이 없어요"
        description="녹음을 시작하면 여기에 기록이 쌓입니다."
      />
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <HistoryItem key={session.id} session={session} />
      ))}
    </div>
  );
}
