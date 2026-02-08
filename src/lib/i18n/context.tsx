"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { translations, Language, TranslationKey } from "./translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  userName: string;
  setUserName: (name: string) => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = "resay-lang";
const NAME_STORAGE_KEY = "resay-user-name";
const DEFAULT_NAME = "Tomo";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("ko");
  const [userName, setUserNameState] = useState(DEFAULT_NAME);

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

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[lang][key];
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, userName, setUserName }}>
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
