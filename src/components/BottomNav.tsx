"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  if (pathname !== "/") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 safe-area-bottom z-0">
      <div className="flex items-end justify-end max-w-md mx-auto px-6 py-2">
        <Link
          href="/history"
          className="flex flex-col items-center py-2 px-4 text-gray-400"
        >
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l4-4 4 4 4-8" />
          </svg>
          <span className="text-xs mt-0.5">{t("nav.history")}</span>
        </Link>
      </div>
    </nav>
  );
}
