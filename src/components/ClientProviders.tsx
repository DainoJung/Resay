"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth/context";
import { LanguageProvider } from "@/lib/i18n/context";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </AuthProvider>
  );
}
