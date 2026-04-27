"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/shared/i18n/i18n-context";

export function CookieNotice() {
  const [accepted, setAccepted] = useState(false);
  const { t } = useI18n();

  if (accepted) return null;

  return (
    <div className="fixed bottom-20 left-1/2 z-30 w-[calc(100%-1rem)] max-w-md -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
      <p className="text-sm text-slate-700">{t("legal.cookie")}</p>
      <div className="mt-3 flex items-center gap-2 text-xs">
        <Link href="/legal/privacy" className="text-slate-600 underline">
          {t("legal.privacy")}
        </Link>
        <Link href="/legal/terms" className="text-slate-600 underline">
          {t("legal.terms")}
        </Link>
        <button
          type="button"
          onClick={() => setAccepted(true)}
          className="ml-auto rounded-lg bg-blue-600 px-3 py-1.5 font-medium text-white"
        >
          {t("legal.accept")}
        </button>
      </div>
    </div>
  );
}
