"use client";

import * as React from "react";
import {
  getCurrentUserAction,
  loginAction,
  logoutAction,
  registerAction,
} from "@/lib/actions/auth";
import type { AuthUser } from "@/lib/actions/auth";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
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
    const u = await loginAction(email, password);
    setUser(u);
  }, []);

  const register = React.useCallback(
    async (fullName: string, email: string, password: string) => {
      const u = await registerAction(fullName, email, password);
      setUser(u);
    },
    []
  );

  const logout = React.useCallback(() => {
    void logoutAction();
    setUser(null);
  }, []);

  const value = React.useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth должен использоваться внутри <AuthProvider>");
  return ctx;
}
