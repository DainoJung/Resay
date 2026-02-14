"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { translations, Language, TranslationKey } from "./translations";
import { useAuth } from "@/lib/auth/context";
import { supabase } from "@/lib/supabase";

export type TTSVoice = "Zephyr" | "Puck" | "Charon" | "Fenrir" | "Leda" | "Orus" | "Aoede";
export type TTSStyle = "normal" | "slow" | "fast" | "calm" | "energetic";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  userName: string;
  setUserName: (name: string) => void;
  ttsVoice: TTSVoice;
  setTtsVoice: (voice: TTSVoice) => void;
  ttsStyle: TTSStyle;
  setTtsStyle: (style: TTSStyle) => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = "resay-lang";
const NAME_STORAGE_KEY = "resay-user-name";
const TTS_VOICE_KEY = "resay-tts-voice";
const TTS_STYLE_KEY = "resay-tts-style";
const DEFAULT_NAME = "";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [lang, setLangState] = useState<Language>("ko");
  const [userName, setUserNameState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(NAME_STORAGE_KEY) || DEFAULT_NAME;
    }
    return DEFAULT_NAME;
  });
  const [ttsVoice, setTtsVoiceState] = useState<TTSVoice>("Puck");
  const [ttsStyle, setTtsStyleState] = useState<TTSStyle>("normal");
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Sync state from profile whenever it changes; fallback to localStorage when no profile
  useEffect(() => {
    if (profile) {
      // Check for onboarding data to sync (takes priority over profile)
      const onboardingNative = localStorage.getItem("resay-onboarding-native");
      const onboardingLearning = localStorage.getItem("resay-onboarding-learning");
      const onboardingName = localStorage.getItem("resay-onboarding-name");

      if (onboardingNative || onboardingLearning || onboardingName) {
        const native = (onboardingNative || profile.native_language) as Language;
        if (native === "ko" || native === "ja" || native === "zh") {
          setLangState(native);
          document.documentElement.lang = native;
          localStorage.setItem(STORAGE_KEY, native);
        }
        if (onboardingName) {
          setUserNameState(onboardingName);
          localStorage.setItem(NAME_STORAGE_KEY, onboardingName);
        } else if (profile.display_name) {
          setUserNameState(profile.display_name);
        }
        if (profile.tts_voice) setTtsVoiceState(profile.tts_voice as TTSVoice);
        if (profile.tts_style) setTtsStyleState(profile.tts_style as TTSStyle);

        // Sync onboarding data to DB
        if (user) {
          const updates: Record<string, string> = {};
          if (onboardingNative) updates.native_language = onboardingNative;
          if (onboardingLearning) updates.learning_language = onboardingLearning;
          if (onboardingName) updates.display_name = onboardingName;
          supabase.from("profiles").update(updates).eq("id", user.id);
        }

        // Clear onboarding keys
        localStorage.removeItem("resay-onboarding-native");
        localStorage.removeItem("resay-onboarding-learning");
        localStorage.removeItem("resay-onboarding-name");
        setProfileLoaded(true);
        return;
      }

      // Normal profile sync
      const profileLang = profile.native_language as Language;
      if (profileLang === "ko" || profileLang === "ja" || profileLang === "zh") {
        setLangState(profileLang);
        document.documentElement.lang = profileLang;
      }
      if (profile.display_name) {
        setUserNameState(profile.display_name);
      }
      if (profile.tts_voice) {
        setTtsVoiceState(profile.tts_voice as TTSVoice);
      }
      if (profile.tts_style) {
        setTtsStyleState(profile.tts_style as TTSStyle);
      }
      setProfileLoaded(true);
      return;
    }

    if (!profileLoaded) {
      // Fallback to localStorage when no profile (e.g., onboarding page)
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "ko" || saved === "ja" || saved === "zh") {
        setLangState(saved);
        document.documentElement.lang = saved;
      }
      const savedName = localStorage.getItem(NAME_STORAGE_KEY);
      if (savedName) setUserNameState(savedName);
      const savedVoice = localStorage.getItem(TTS_VOICE_KEY);
      if (savedVoice) setTtsVoiceState(savedVoice as TTSVoice);
      const savedStyle = localStorage.getItem(TTS_STYLE_KEY);
      if (savedStyle) setTtsStyleState(savedStyle as TTSStyle);
    }
  }, [profile, profileLoaded, user]);

  const syncProfile = useCallback(
    (updates: Record<string, string>) => {
      if (user) {
        supabase.from("profiles").update(updates).eq("id", user.id).then(() => { });
      }
    },
    [user]
  );

  const setLang = useCallback(
    (newLang: Language) => {
      setLangState(newLang);
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
      syncProfile({ native_language: newLang });
    },
    [syncProfile]
  );

  const setUserName = useCallback(
    (name: string) => {
      setUserNameState(name);
      localStorage.setItem(NAME_STORAGE_KEY, name);
      syncProfile({ display_name: name });
    },
    [syncProfile]
  );

  const setTtsVoice = useCallback(
    (voice: TTSVoice) => {
      setTtsVoiceState(voice);
      localStorage.setItem(TTS_VOICE_KEY, voice);
      syncProfile({ tts_voice: voice });
    },
    [syncProfile]
  );

  const setTtsStyle = useCallback(
    (style: TTSStyle) => {
      setTtsStyleState(style);
      localStorage.setItem(TTS_STYLE_KEY, style);
      syncProfile({ tts_style: style });
    },
    [syncProfile]
  );

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[lang][key];
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, userName, setUserName, ttsVoice, setTtsVoice, ttsStyle, setTtsStyle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
