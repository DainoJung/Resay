"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useLanguage, TTSVoice, TTSStyle } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { Language } from "@/lib/i18n/translations";

const languages: { code: Language; flag: string; label: string }[] = [
  { code: "ko", flag: "\uD83C\uDDF0\uD83C\uDDF7", label: "\uD55C\uAD6D\uC5B4" },
  { code: "ja", flag: "\uD83C\uDDEF\uD83C\uDDF5", label: "\u65E5\u672C\u8A9E" },
  { code: "zh", flag: "\uD83C\uDDE8\uD83C\uDDF3", label: "\u4E2D\u6587" },
];

const targetLanguages: { code: string; flag: string; label: string; available: boolean }[] = [
  { code: "en", flag: "\uD83C\uDDFA\uD83C\uDDF8", label: "English", available: true },
  { code: "ja", flag: "\uD83C\uDDEF\uD83C\uDDF5", label: "\u65E5\u672C\u8A9E", available: false },
  { code: "zh", flag: "\uD83C\uDDE8\uD83C\uDDF3", label: "\u4E2D\u6587", available: false },
];

const voices: { id: TTSVoice; label: string }[] = [
  { id: "Zephyr", label: "Zephyr" },
  { id: "Puck", label: "Puck" },
  { id: "Charon", label: "Charon" },
  { id: "Fenrir", label: "Fenrir" },
  { id: "Leda", label: "Leda" },
  { id: "Orus", label: "Orus" },
  { id: "Aoede", label: "Aoede" },
];

const styles: { id: TTSStyle; labelKey: "settings.ttsStyle.normal" | "settings.ttsStyle.slow" | "settings.ttsStyle.fast" | "settings.ttsStyle.calm" | "settings.ttsStyle.energetic" }[] = [
  { id: "normal", labelKey: "settings.ttsStyle.normal" },
  { id: "slow", labelKey: "settings.ttsStyle.slow" },
  { id: "fast", labelKey: "settings.ttsStyle.fast" },
  { id: "calm", labelKey: "settings.ttsStyle.calm" },
  { id: "energetic", labelKey: "settings.ttsStyle.energetic" },
];

export default function SettingsPage() {
  const { lang, setLang, t, userName, setUserName, ttsVoice, setTtsVoice, ttsStyle, setTtsStyle } = useLanguage();
  const { user, signOut } = useAuth();
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const handlePreviewVoice = async (voiceId: TTSVoice) => {
    // Stop current preview
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    if (previewingVoice === voiceId) {
      setPreviewingVoice(null);
      return;
    }

    // Create/resume AudioContext on user gesture (before async)
    const ctx = getAudioContext();

    setPreviewingVoice(voiceId);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Hi there! How are you doing today?", voice: voiceId }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => {
        setPreviewingVoice(null);
        sourceNodeRef.current = null;
      };
      source.start();
      sourceNodeRef.current = source;
    } catch {
      setPreviewingVoice(null);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen max-w-md mx-auto">
      {/* Header */}
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
          <h1 className="text-base font-semibold text-gray-900">{t("settings.title")}</h1>
        </div>
      </div>

      <div className="px-4 pt-6 pb-24">
      {/* Account section */}
      <div className="space-y-2 mb-8">
        <h2 className="text-sm font-medium text-gray-500 px-1">{t("settings.account")}</h2>
        <p className="text-xs text-gray-500 px-1 mb-3">{t("settings.accountDescription")}</p>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="ml-3 text-sm text-red-500 font-medium hover:text-red-600 transition-colors flex-shrink-0"
            >
              {t("settings.logout")}
            </button>
          </div>
        </div>
      </div>

      {/* Name setting */}
      <div className="space-y-2 mb-8">
        <h2 className="text-sm font-medium text-gray-500 px-1">{t("settings.name")}</h2>
        <p className="text-xs text-gray-500 px-1 mb-3">{t("settings.nameDescription")}</p>
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
        <p className="text-xs text-gray-500 px-1 mb-3">{t("settings.targetLanguageDescription")}</p>

        <div className="grid grid-cols-2 gap-2">
          {targetLanguages.map(({ code, flag, label, available }) => {
            const isActive = code === "en";
            return (
              <div
                key={code}
                className={`rounded-2xl border px-3 py-3 transition-colors ${isActive
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
                    <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full flex-shrink-0">
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
      <div className="space-y-2 mb-8">
        <h2 className="text-sm font-medium text-gray-500 px-1">{t("settings.language")}</h2>
        <p className="text-xs text-gray-500 px-1 mb-3">{t("settings.languageDescription")}</p>

        <div className="grid grid-cols-2 gap-2">
          {languages.map(({ code, flag, label }) => {
            const isActive = lang === code;
            return (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`rounded-2xl border px-3 py-3 transition-colors ${isActive
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

      {/* TTS Voice setting */}
      <div className="space-y-2 mb-8">
        <h2 className="text-sm font-medium text-gray-500 px-1">{t("settings.ttsVoice")}</h2>
        <p className="text-xs text-gray-500 px-1 mb-3">{t("settings.ttsVoiceDescription")}</p>

        <div className="grid grid-cols-2 gap-2">
          {voices.map(({ id, label }) => {
            const isActive = ttsVoice === id;
            const isPreviewing = previewingVoice === id;
            return (
              <div
                key={id}
                onClick={() => setTtsVoice(id)}
                className={`rounded-2xl border px-3 py-3 transition-colors cursor-pointer ${isActive
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium flex-1 text-left ${isActive ? "text-blue-600" : "text-gray-700"}`}>
                    {label}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewVoice(id);
                    }}
                    className={`flex-shrink-0 transition-colors ${isPreviewing ? "text-blue-500" : "text-gray-400 hover:text-gray-600"
                      }`}
                  >
                    {isPreviewing ? (
                      <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TTS Style setting */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-gray-500 px-1">{t("settings.ttsStyle")}</h2>
        <p className="text-xs text-gray-500 px-1 mb-3">{t("settings.ttsStyleDescription")}</p>

        <div className="flex flex-wrap gap-2">
          {styles.map(({ id, labelKey }) => {
            const isActive = ttsStyle === id;
            return (
              <button
                key={id}
                onClick={() => setTtsStyle(id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${isActive
                  ? "border-blue-400 bg-blue-50 text-blue-600"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
              >
                {t(labelKey)}
              </button>
            );
          })}
        </div>
      </div>
      </div>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-xs bg-white rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 text-center">
              {t("settings.logoutConfirm")}
            </h3>
            <p className="text-sm text-gray-500 text-center">
              {t("settings.logoutConfirmDesc")}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t("settings.cancel")}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-medium text-white hover:bg-red-600 transition-colors"
              >
                {t("settings.logout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
