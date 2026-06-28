"use client";

import * as React from "react";
import {
  getCurrentUserAction,
  loginAction,
  logoutAction,
  registerAction,
  verifyTwoFactorAction,
} from "@/lib/actions/auth";
import type { AuthUser, LoginResult } from "@/lib/actions/auth";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  verifyTwoFactor: (ticket: string, code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    getCurrentUserAction()
      .then((u) => {
        if (active) setUser(u);
      })
      .catch(() => {
        // not authenticated
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const res = await loginAction(email, password);
    if (res.status === "ok") setUser(res.user);
    return res;
  }, []);

  const register = React.useCallback(
    async (fullName: string, email: string, password: string) => {
      const u = await registerAction(fullName, email, password);
      setUser(u);
    },
    []
  );

  const verifyTwoFactor = React.useCallback(async (ticket: string, code: string) => {
    const u = await verifyTwoFactorAction(ticket, code);
    setUser(u);
  }, []);

  const logout = React.useCallback(() => {
    void logoutAction();
    setUser(null);
  }, []);

  const value = React.useMemo(
    () => ({ user, loading, login, register, verifyTwoFactor, logout }),
    [user, loading, login, register, verifyTwoFactor, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth должен использоваться внутри <AuthProvider>");
  return ctx;
}
