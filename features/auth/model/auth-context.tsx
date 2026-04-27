"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  logout as logoutRequest,
  refreshAccessToken,
} from "@/features/auth/api/auth-api";

type AuthContextValue = {
  accessToken: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  setAccessToken: (token: string | null) => void;
  refresh: (isInitial?: boolean) => Promise<string | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const refresh = useCallback(async (isInitial = false) => {
    try {
      const result = await refreshAccessToken();
      setAccessToken(result.accessToken);
      return result.accessToken;
    } catch {
      setAccessToken(null);
      return null;
    } finally {
      if (isInitial) {
        setIsBootstrapping(false);
      }
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setAccessToken(null);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh(true);
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      isAuthenticated: Boolean(accessToken),
      isBootstrapping,
      setAccessToken,
      refresh,
      logout,
    }),
    [accessToken, isBootstrapping, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
