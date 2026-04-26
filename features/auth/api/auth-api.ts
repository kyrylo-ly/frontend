import { apiFetch } from "@/shared/api/http";

export type IdentifierType = "phone" | "email";

export type SendOtpRequest = {
  identifier: string;
  type: IdentifierType;
};

export type VerifyOtpRequest = {
  identifier: string;
  code: string;
  type: IdentifierType;
};

export type AccessTokenResponse = {
  accessToken: string;
};

export type TelegramVerifyRequest = {
  tgAuthResult: string;
};

export type TelegramVerifyResponse =
  | { accessToken: string }
  | { url: string }
  | { sessionId: string };

export type TelegramFinalizeRequest = {
  sessionId: string;
};

export async function sendOtp(payload: SendOtpRequest) {
  return apiFetch("/auth/otp/send", {
    method: "POST",
    body: payload,
  });
}

export async function verifyOtp(payload: VerifyOtpRequest) {
  return apiFetch<AccessTokenResponse>("/auth/otp/Verify", {
    method: "POST",
    body: payload,
  });
}

export async function refreshAccessToken() {
  return apiFetch<AccessTokenResponse>("/auth/refresh", {
    method: "POST",
  });
}

export async function logout() {
  return apiFetch<{ ok: boolean }>("/auth/logout", {
    method: "POST",
  });
}

export async function telegramInit() {
  return apiFetch<{ url?: string; [key: string]: unknown }>("/auth/telegram", {
    method: "GET",
  });
}

export async function telegramVerify(payload: TelegramVerifyRequest) {
  return apiFetch<TelegramVerifyResponse>("/auth/telegram/verify", {
    method: "POST",
    body: payload,
  });
}

export async function telegramFinalize(payload: TelegramFinalizeRequest) {
  return apiFetch<AccessTokenResponse>("/auth/telegram/finalize", {
    method: "POST",
    body: payload,
  });
}
