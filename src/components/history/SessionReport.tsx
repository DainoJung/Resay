"use client";

import SemiCircularGauge from "./SemiCircularGauge";
import MetricCard from "./MetricCard";
import { useLanguage } from "@/lib/i18n/context";
import { TranslationKey } from "@/lib/i18n/translations";

interface SessionReportProps {
  overallScore: number;
  grammarScore: number;
  vocabularyScore: number;
  fluencyScore: number;
  naturalnessScore: number;
}

function getGrade(score: number, t: (key: TranslationKey) => string): string {
  if (score >= 90) return t("report.excellent");
  if (score >= 75) return t("report.good");
  if (score >= 60) return t("report.fair");
  if (score >= 40) return t("report.keepTrying");
  return t("report.needsPractice");
}

// Grammar — checklist / spell-check icon
const GrammarIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Vocabulary — book-open icon
const VocabularyIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

// Fluency — chat-bubble / speech icon
const FluencyIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
  </svg>
);

// Naturalness — sparkles icon
const NaturalnessIcon = (
  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

// Report title — bar-chart icon
const ReportTitleIcon = (
  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

export default function SessionReport({
  overallScore,
  grammarScore,
  vocabularyScore,
  fluencyScore,
  naturalnessScore,
}: SessionReportProps) {
  const { t } = useLanguage();
  const grade = getGrade(overallScore, t);

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-1.5">
        {ReportTitleIcon}
        {t("report.title")}
      </h2>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-3">
        <SemiCircularGauge score={overallScore} grade={grade} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={GrammarIcon}
          label={t("report.grammar")}
          score={grammarScore}
        />
        <MetricCard
          icon={VocabularyIcon}
          label={t("report.vocabulary")}
          score={vocabularyScore}
        />
        <MetricCard
          icon={FluencyIcon}
          label={t("report.fluency")}
          score={fluencyScore}
        />
        <MetricCard
          icon={NaturalnessIcon}
          label={t("report.naturalness")}
          score={naturalnessScore}
        />
      </div>
    </div>
  );
}
