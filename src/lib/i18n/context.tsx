"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { translations, Language, TranslationKey } from "./translations";

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
const DEFAULT_NAME = "Tomo";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("ko");
  const [userName, setUserNameState] = useState(DEFAULT_NAME);
  const [ttsVoice, setTtsVoiceState] = useState<TTSVoice>("Puck");
  const [ttsStyle, setTtsStyleState] = useState<TTSStyle>("normal");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "ko" || saved === "ja") {
      setLangState(saved);
      document.documentElement.lang = saved;
    }
    const savedName = localStorage.getItem(NAME_STORAGE_KEY);
    if (savedName) {
      setUserNameState(savedName);
    }
    const savedVoice = localStorage.getItem(TTS_VOICE_KEY);
    if (savedVoice) setTtsVoiceState(savedVoice as TTSVoice);
    const savedStyle = localStorage.getItem(TTS_STYLE_KEY);
    if (savedStyle) setTtsStyleState(savedStyle as TTSStyle);
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
    document.documentElement.lang = newLang;
  }, []);

  const setUserName = useCallback((name: string) => {
    setUserNameState(name);
    localStorage.setItem(NAME_STORAGE_KEY, name);
  }, []);

  const setTtsVoice = useCallback((voice: TTSVoice) => {
    setTtsVoiceState(voice);
    localStorage.setItem(TTS_VOICE_KEY, voice);
  }, []);

  const setTtsStyle = useCallback((style: TTSStyle) => {
    setTtsStyleState(style);
    localStorage.setItem(TTS_STYLE_KEY, style);
  }, []);

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
