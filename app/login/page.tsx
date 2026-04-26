"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
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

export default function LoginPage() {
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
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Login</h1>
        <Link href="/" className="text-sm underline">
          Home
        </Link>
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>
      ) : null}
      {message ? (
        <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      <section className="rounded-lg border border-zinc-200 p-4">
        <h2 className="mb-3 text-lg font-medium">OTP login</h2>
        <form className="flex flex-col gap-3" onSubmit={onSendOtp}>
          <input
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="Email or phone"
            required
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
          <select
            value={type}
            onChange={(event) => setType(event.target.value as IdentifierType)}
            className="rounded-md border border-zinc-300 px-3 py-2"
          >
            <option value="email">email</option>
            <option value="phone">phone</option>
          </select>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            Send OTP
          </button>
        </form>

        {otpRequested ? (
          <form className="mt-4 flex flex-col gap-3" onSubmit={onVerifyOtp}>
            <input
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="6-digit code"
              required
              pattern="\d{6}"
              className="rounded-md border border-zinc-300 px-3 py-2"
            />
            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
            >
              Verify OTP
            </button>
          </form>
        ) : null}
      </section>

      <section className="rounded-lg border border-zinc-200 p-4">
        <h2 className="mb-3 text-lg font-medium">Telegram login</h2>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onTelegramInit}
            disabled={isLoading}
            className="w-fit rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            Init Telegram Login
          </button>
          {telegramUrl ? (
            <a href={telegramUrl} target="_blank" className="text-sm underline">
              Open Telegram URL
            </a>
          ) : null}
        </div>

        <form className="mt-4 flex flex-col gap-3" onSubmit={onTelegramVerify}>
          <textarea
            value={tgAuthResult}
            onChange={(event) => setTgAuthResult(event.target.value)}
            placeholder="Paste tgAuthResult (base64 string)"
            required
            className="min-h-24 rounded-md border border-zinc-300 px-3 py-2"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-fit rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            Verify Telegram
          </button>
        </form>

        <form className="mt-4 flex flex-col gap-3" onSubmit={onTelegramFinalize}>
          <input
            value={sessionId}
            onChange={(event) => setSessionId(event.target.value)}
            placeholder="Session ID (if finalize required)"
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
          <button
            type="submit"
            disabled={isLoading || !sessionId}
            className="w-fit rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            Finalize Telegram
          </button>
        </form>
      </section>
    </main>
  );
}
