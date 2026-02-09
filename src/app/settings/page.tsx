"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";

const languages: { code: Language; flag: string; label: string }[] = [
  { code: "ko", flag: "\uD83C\uDDF0\uD83C\uDDF7", label: "\uD55C\uAD6D\uC5B4" },
  { code: "ja", flag: "\uD83C\uDDEF\uD83C\uDDF5", label: "\u65E5\u672C\u8A9E" },
];

const targetLanguages: { code: string; flag: string; label: string; available: boolean }[] = [
  { code: "en", flag: "\uD83C\uDDFA\uD83C\uDDF8", label: "English", available: true },
  { code: "ja", flag: "\uD83C\uDDEF\uD83C\uDDF5", label: "\u65E5\u672C\u8A9E", available: false },
  { code: "zh", flag: "\uD83C\uDDE8\uD83C\uDDF3", label: "\u4E2D\u6587", available: false },
];

export default function SettingsPage() {
  const { lang, setLang, t, userName, setUserName } = useLanguage();

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("settings.title")}</h1>

      {/* Name setting */}
      <div className="space-y-2 mb-8">
        <h2 className="text-sm font-medium text-gray-500 px-1">{t("settings.name")}</h2>
        <p className="text-xs text-gray-400 px-1 mb-3">{t("settings.nameDescription")}</p>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder={t("settings.namePlaceholder")}
          className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 font-medium outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
        />
      </div>

      {/* Target language setting */}
      <div className="space-y-2 mb-8">
        <h2 className="text-sm font-medium text-gray-500 px-1">{t("settings.targetLanguage")}</h2>
        <p className="text-xs text-gray-400 px-1 mb-3">{t("settings.targetLanguageDescription")}</p>

        <div className="grid grid-cols-2 gap-2">
          {targetLanguages.map(({ code, flag, label, available }) => {
            const isActive = code === "en";
            return (
              <div
                key={code}
                className={`rounded-2xl border px-3 py-3 transition-colors ${
                  isActive
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 bg-gray-50 opacity-60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{flag}</span>
                  <span className={`text-sm font-medium flex-1 ${isActive ? "text-blue-600" : "text-gray-400"}`}>
                    {label}
                  </span>
                  {isActive ? (
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : !available ? (
                    <span className="text-[10px] text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      {t("settings.comingSoon")}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Language setting */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-gray-500 px-1">{t("settings.language")}</h2>
        <p className="text-xs text-gray-400 px-1 mb-3">{t("settings.languageDescription")}</p>

        <div className="grid grid-cols-2 gap-2">
          {languages.map(({ code, flag, label }) => {
            const isActive = lang === code;
            return (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`rounded-2xl border px-3 py-3 transition-colors ${
                  isActive
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{flag}</span>
                  <span className={`text-sm font-medium flex-1 text-left ${isActive ? "text-blue-600" : "text-gray-700"}`}>
                    {label}
                  </span>
                  {isActive && (
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
