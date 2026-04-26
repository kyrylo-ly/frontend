"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/model/auth-context";

export default function DashboardPage() {
  const { logout, accessToken } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-zinc-600">
        You are authenticated. Access token is stored in app state.
      </p>
      <pre className="overflow-auto rounded-md bg-zinc-100 p-3 text-xs text-zinc-800">
        {accessToken ?? "No access token"}
      </pre>
      <button
        type="button"
        onClick={handleLogout}
        className="w-fit rounded-md bg-black px-4 py-2 text-sm text-white hover:opacity-90"
      >
        Logout
      </button>
    </main>
  );
}
