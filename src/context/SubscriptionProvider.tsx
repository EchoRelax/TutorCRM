"use client";

import * as React from "react";
import { Crown, Check } from "lucide-react";
import { FREE_STUDENT_LIMIT, PRO_FEATURES } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Plan = "free" | "pro" | "lifetime";

interface SubscriptionValue {
  plan: Plan;
  isPro: boolean;
  isLifetime: boolean;
  limit: number;
  setPlan: (plan: Plan) => void;
  grantPro: () => void;
  grantLifetime: () => void;
  revokePro: () => void;
  upsellOpen: boolean;
  showUpsell: () => void;
  hideUpsell: () => void;
}

const SubscriptionContext = React.createContext<SubscriptionValue | null>(null);
const STORAGE_KEY = "tutorcrm:plan";

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlanState] = React.useState<Plan>("free");
  const [upsellOpen, setUpsellOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "pro" || stored === "free" || stored === "lifetime") setPlanState(stored);
    } catch {
      // ignore
    }
  }, []);

  const persist = (next: Plan) => {
    setPlanState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  const value = React.useMemo<SubscriptionValue>(
    () => ({
      plan,
      isPro: plan !== "free",
      isLifetime: plan === "lifetime",
      limit: FREE_STUDENT_LIMIT,
      setPlan: persist,
      grantPro: () => persist("pro"),
      grantLifetime: () => persist("lifetime"),
      revokePro: () => persist("free"),
      upsellOpen,
      showUpsell: () => setUpsellOpen(true),
      hideUpsell: () => setUpsellOpen(false),
    }),
    [plan, upsellOpen]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
      <ProUpsellDialog />
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionValue {
  const ctx = React.useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription должен использоваться внутри <SubscriptionProvider>");
  return ctx;
}

function ProUpsellDialog() {
  const { upsellOpen, hideUpsell } = useSubscription();

  return (
    <Dialog open={upsellOpen} onOpenChange={(o) => !o && hideUpsell()}>
      <DialogContent onOpenChange={(o) => !o && hideUpsell()} className="overflow-hidden sm:max-w-md">
        <div className="relative bg-primary p-6 text-primary-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
            <Crown className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-white">Достигнут лимит тарифа Free</h2>
          <p className="mt-1 text-sm text-white/85">
            На Free можно вести до {FREE_STUDENT_LIMIT} учеников. Расширенные тарифы Pro и Lifetime будут доступны после завершения бета-тестирования.
          </p>
        </div>

        <DialogBody className="space-y-2.5">
          <p className="text-sm font-medium text-muted-foreground">Что будет в расширенных тарифах:</p>
          {PRO_FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-2.5 text-sm">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                <Check className="h-3.5 w-3.5" />
              </span>
              {f}
            </div>
          ))}
        </DialogBody>

        <DialogFooter>
          <Button onClick={hideUpsell} className="w-full">
            Понятно
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
