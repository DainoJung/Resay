"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";

const languages: { code: Language; flag: string; label: string }[] = [
  { code: "ko", flag: "\uD83C\uDDF0\uD83C\uDDF7", label: "\uD55C\uAD6D\uC5B4" },
  { code: "ja", flag: "\uD83C\uDDEF\uD83C\uDDF5", label: "\u65E5\u672C\u8A9E" },
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

      {/* Language setting */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-gray-500 px-1">{t("settings.language")}</h2>
        <p className="text-xs text-gray-400 px-1 mb-3">{t("settings.languageDescription")}</p>

        <div className="space-y-2">
          {languages.map(({ code, flag, label }) => {
            const isActive = lang === code;
            return (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`w-full text-left rounded-2xl border p-4 transition-colors ${
                  isActive
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{flag}</span>
                  <span className={`font-medium ${isActive ? "text-blue-600" : "text-gray-700"}`}>
                    {label}
                  </span>
                  {isActive && (
                    <svg className="w-5 h-5 text-blue-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
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
