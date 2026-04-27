import { AuthGuard } from "@/features/auth/ui/auth-guard";
import { AppShell } from "@/features/app/ui/app-shell";
import { CookieNotice } from "@/features/legal/ui/cookie-notice";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AppShell>
        {children}
        <CookieNotice />
      </AppShell>
    </AuthGuard>
  );
}
