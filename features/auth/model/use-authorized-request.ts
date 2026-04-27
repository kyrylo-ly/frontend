"use client";

import { useCallback } from "react";
import { useAuth } from "@/features/auth/model/auth-context";
import { apiFetch, type AuthorizedRequest, type FetchOptions } from "@/shared/api/http";

export function useAuthorizedRequest(): AuthorizedRequest {
  const { accessToken, refresh } = useAuth();

  return useCallback(
    async <T>(path: string, options: FetchOptions = {}) => {
      const makeRequest = (token: string | null) =>
        apiFetch<T>(path, {
          ...options,
          headers: {
            ...(options.headers ?? {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

      try {
        return await makeRequest(accessToken);
      } catch {
        const refreshedToken = await refresh();
        if (!refreshedToken) throw new Error("Unauthorized");
        return makeRequest(refreshedToken);
      }
    },
    [accessToken, refresh],
  );
}
