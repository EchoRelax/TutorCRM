"use client";

import * as React from "react";
import { AuthProvider } from "@/context/AuthProvider";
import { DataProvider } from "@/context/DataProvider";
import { ToastProvider } from "@/context/ToastProvider";
import { QuickAddProvider } from "@/context/QuickAddProvider";
import { ThemeProvider } from "@/context/ThemeProvider";
import { SubscriptionProvider } from "@/context/SubscriptionProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <DataProvider>
            <SubscriptionProvider>
              <QuickAddProvider>{children}</QuickAddProvider>
            </SubscriptionProvider>
          </DataProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
