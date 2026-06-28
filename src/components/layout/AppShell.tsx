"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="center-screen">
        <Loader2 className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="app-frame">
        <Sidebar />
        <div className="app-main">
          <Topbar />
          <main className="app-content">
            <div className="maxw-page">{children}</div>
          </main>
        </div>
        <MobileNav />
      </div>
    </div>
  );
}
