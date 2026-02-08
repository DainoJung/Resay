"use client";

import { Session } from "@/types";
import HistoryItem from "./HistoryItem";
import EmptyState from "./EmptyState";
import { useLanguage } from "@/lib/i18n/context";

interface HistoryListProps {
  sessions: Session[];
  onSelect: (session: Session) => void;
}

export default function HistoryList({ sessions, onSelect }: HistoryListProps) {
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
        <HistoryItem key={session.id} session={session} onSelect={onSelect} />
      ))}
    </div>
  );
}
