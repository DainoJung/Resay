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
        <span className="text-emerald-500">&#x1F4CA;</span>
        {t("report.title")}
      </h2>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-3">
        <SemiCircularGauge score={overallScore} grade={grade} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon="&#x1F4DD;"
          label={t("report.grammar")}
          score={grammarScore}
        />
        <MetricCard
          icon="&#x1F4D6;"
          label={t("report.vocabulary")}
          score={vocabularyScore}
        />
        <MetricCard
          icon="&#x1F5E3;"
          label={t("report.fluency")}
          score={fluencyScore}
        />
        <MetricCard
          icon="&#x2728;"
          label={t("report.naturalness")}
          score={naturalnessScore}
        />
      </div>
    </div>
  );
}
