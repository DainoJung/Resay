"use client";

import { Session } from "@/types";
import HistoryItem from "./HistoryItem";
import EmptyState from "./EmptyState";
import { useLanguage } from "@/lib/i18n/context";

interface HistoryListProps {
  sessions: Session[];
  onSelect: (session: Session) => void;
  onRetry?: (sessionId: string) => void;
  onDelete?: (sessionId: string) => void;
  retryingId?: string | null;
}

export default function HistoryList({ sessions, onSelect, onRetry, onDelete, retryingId }: HistoryListProps) {
  const { t } = useLanguage();

  if (sessions.length === 0) {
    return (
      <EmptyState
        title={t("history.empty.title")}
        description={t("history.empty.description")}
      />
    );
  }

  return (
    <div>
      {sessions.map((session) => (
        <HistoryItem
          key={session.id}
          session={session}
          onSelect={onSelect}
          onRetry={onRetry}
          onDelete={onDelete}
          isRetrying={retryingId === session.id}
        />
      ))}
    </div>
  );
}
