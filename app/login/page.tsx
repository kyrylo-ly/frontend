"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import {
  sendOtp,
  telegramFinalize,
  telegramInit,
  telegramVerify,
  verifyOtp,
  type IdentifierType,
} from "@/features/auth/api/auth-api";
import { ApiError } from "@/shared/api/http";
import { useAuth } from "@/features/auth/model/auth-context";

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Unexpected error";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";
  const { setAccessToken, isAuthenticated } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [type, setType] = useState<IdentifierType>("email");
  const [code, setCode] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [tgAuthResult, setTgAuthResult] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [telegramUrl, setTelegramUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"otp" | "telegram">("otp");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(nextPath);
    }
  }, [isAuthenticated, nextPath, router]);

  const onSendOtp = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      await sendOtp({ identifier, type });
      setOtpRequested(true);
      setMessage("OTP sent successfully. Check your contact.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyOtp = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const result = await verifyOtp({ identifier, code, type });
      setAccessToken(result.accessToken);
      router.replace(nextPath);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const onTelegramInit = async () => {
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const result = await telegramInit();
      if (typeof result.url === "string") {
        setTelegramUrl(result.url);
        window.open(result.url, "_blank", "noopener,noreferrer");
        setMessage("Telegram init received. Complete auth and paste result.");
      } else {
        setMessage("Telegram init completed. Paste Telegram auth result.");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const onTelegramVerify = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const result = await telegramVerify({ tgAuthResult });
      if ("accessToken" in result && typeof result.accessToken === "string") {
        setAccessToken(result.accessToken);
        router.replace(nextPath);
        return;
      }

      if ("sessionId" in result && typeof result.sessionId === "string") {
        setSessionId(result.sessionId);
        setMessage("Session created. Finalize Telegram login.");
        return;
      }

      if ("url" in result && typeof result.url === "string") {
        setTelegramUrl(result.url);
        window.open(result.url, "_blank", "noopener,noreferrer");
        setMessage("Follow Telegram URL and then finalize login.");
        return;
      }

      setError("Unknown Telegram verify response.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const onTelegramFinalize = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const result = await telegramFinalize({ sessionId });
      setAccessToken(result.accessToken);
      router.replace(nextPath);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 gap-8 px-6 py-10 lg:grid-cols-[1fr_1.1fr]">
      <section className="space-y-6">
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
        >
          Back to home
        </Link>
        <div className="space-y-3">
          <p className="inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-700">
            Secure access
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="max-w-md text-slate-600">
            Sign in via OTP or Telegram. Your session is refreshed
            automatically using secure httpOnly cookies.
          </p>
        </div>
        <div className="grid gap-3">
          <article className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-900">Fast onboarding</p>
            <p className="mt-1 text-sm text-slate-600">
              New users can verify in under a minute.
            </p>
          </article>
          <article className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-900">No password flow</p>
            <p className="mt-1 text-sm text-slate-600">
              Use one-time codes or Telegram authentication.
            </p>
          </article>
        </div>
      </section>

      <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-2xl shadow-slate-300/20 backdrop-blur">
        <div className="mb-4 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setAuthMode("otp")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              authMode === "otp"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            OTP Login
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("telegram")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              authMode === "telegram"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Telegram Login
          </button>
        </div>

        {error ? (
          <p className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}

        {authMode === "otp" ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Sign in with OTP
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter your email or phone to receive a verification code.
              </p>
            </div>
            <form className="space-y-3" onSubmit={onSendOtp}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Email or phone
                </label>
                <input
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="john.doe@example.com"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-slate-200 transition focus:ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Identifier type
                </label>
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value as IdentifierType)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-slate-200 transition focus:ring"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isLoading || !identifier.trim()}
                className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Sending..." : "Send OTP"}
              </button>
            </form>

            {otpRequested ? (
              <form
                className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                onSubmit={onVerifyOtp}
              >
                <p className="text-sm font-medium text-slate-700">
                  Enter 6-digit code
                </p>
                <input
                  value={code}
                  onChange={(event) =>
                    setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="123456"
                  required
                  pattern="\d{6}"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm tracking-[0.2em] outline-none ring-slate-200 transition focus:ring"
                />
                <button
                  type="submit"
                  disabled={isLoading || code.length !== 6}
                  className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Verifying..." : "Verify and continue"}
                </button>
              </form>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Sign in with Telegram
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Initialize Telegram flow, then verify auth result and finalize
                if needed.
              </p>
            </div>
            <button
              type="button"
              onClick={onTelegramInit}
              disabled={isLoading}
              className="w-full rounded-xl bg-[#229ED9] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1788be] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Initializing..." : "Init Telegram Login"}
            </button>
            {telegramUrl ? (
              <a
                href={telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex text-sm font-medium text-slate-700 underline underline-offset-4 hover:text-slate-900"
              >
                Open Telegram login URL
              </a>
            ) : null}

            <form className="space-y-3" onSubmit={onTelegramVerify}>
              <label className="text-sm font-medium text-slate-700">
                `tgAuthResult`
              </label>
              <textarea
                value={tgAuthResult}
                onChange={(event) => setTgAuthResult(event.target.value)}
                placeholder="Paste base64 auth payload from Telegram"
                required
                className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-slate-200 transition focus:ring"
              />
              <button
                type="submit"
                disabled={isLoading || !tgAuthResult.trim()}
                className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Verifying..." : "Verify Telegram"}
              </button>
            </form>

            <form
              className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
              onSubmit={onTelegramFinalize}
            >
              <p className="text-sm font-medium text-slate-700">
                Finalize (optional)
              </p>
              <input
                value={sessionId}
                onChange={(event) => setSessionId(event.target.value)}
                placeholder="Session ID"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-slate-200 transition focus:ring"
              />
              <button
                type="submit"
                disabled={isLoading || !sessionId.trim()}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Finalizing..." : "Finalize Telegram Login"}
              </button>
            </form>
          </div>
        )}
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-sm text-slate-500">Loading auth...</div>}>
      <LoginForm />
    </Suspense>
  );
}
