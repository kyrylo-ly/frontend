"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/model/auth-context";
import { useI18n } from "@/shared/i18n/i18n-context";

const navItems = [
  { href: "/communities", key: "nav.communities" as const },
  { href: "/my-initiatives", key: "nav.myInitiatives" as const },
  { href: "/my-communities", key: "nav.myCommunities" as const },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { locale, setLocale, t } = useI18n();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/communities" className="text-base font-semibold text-slate-900">
            Razom Pay
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLocale(locale === "uk" ? "en" : "uk")}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600"
            >
              {locale.toUpperCase()}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700"
            >
              {t("nav.logout")}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5">{children}</main>

      <nav className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-3 gap-2">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2 text-center text-xs font-medium transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
