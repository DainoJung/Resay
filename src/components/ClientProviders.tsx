"use client";

import { ReactNode } from "react";
import { LanguageProvider } from "@/lib/i18n/context";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
