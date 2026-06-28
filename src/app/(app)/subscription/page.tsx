"use client";

import * as React from "react";
import { Check, Lock } from "lucide-react";
import { useSubscription } from "@/context/SubscriptionProvider";
import { useToast } from "@/context/ToastProvider";
import {
  FREE_STUDENT_LIMIT,
  LIFETIME_TAKEN_SPOTS,
  LIFETIME_TOTAL_SPOTS,
  PRO_FEATURES,
} from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BETA_NOTE = "Оформление будет доступно после завершения бета-тестирования.";

export default function SubscriptionPage() {
  const { plan, revokePro } = useSubscription();
  const { toast } = useToast();
  const spotsLeft = Math.max(0, LIFETIME_TOTAL_SPOTS - LIFETIME_TAKEN_SPOTS);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Подписка"
        description={`Ваш тариф: Free (до ${FREE_STUDENT_LIMIT} учеников)`}
      />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        {/* Free */}
        <PlanCard
          name="Free"
          active={plan === "free"}
          description="Для старта — до 5 учеников"
          price={formatCurrency(0)}
          priceSuffix="/ мес"
          features={[
            { ok: true, text: `До ${FREE_STUDENT_LIMIT} учеников` },
            { ok: true, text: "Занятия, оплаты и долги" },
            { ok: true, text: "Домашние задания" },
            { ok: false, text: "Экспорт аналитики" },
            { ok: false, text: "Личные события" },
          ]}
          action={
            <Button variant="outline" className="w-full" disabled={plan === "free"} onClick={() => { revokePro(); toast("Переключено на Free"); }}>
              {plan === "free" ? "Текущий тариф" : "Выбрать Free"}
            </Button>
          }
        />

        {/* Pro — заблокирован в бета */}
        <PlanCard
          name="Pro"
          badge="Скоро"
          highlight
          description="Для активной практики без ограничений"
          price={formatCurrency(490)}
          priceSuffix="/ мес"
          features={PRO_FEATURES.map((text) => ({ ok: true, text }))}
          locked
        />

        {/* Lifetime — заблокирован в бета */}
        <PlanCard
          name="Lifetime"
          description="Разовая оплата навсегда для первых участников"
          price={formatCurrency(4900)}
          priceSuffix="навсегда"
          features={[
            { ok: true, text: "Всё из Pro, навсегда" },
            { ok: true, text: "Единоразовая оплата" },
            { ok: true, text: "Статус первого участника" },
            { ok: true, text: "Все будущие функции" },
          ]}
          footer={
            <div className="mt-1">
              <p className="text-xs font-medium text-muted-foreground">
                Осталось {spotsLeft} из {LIFETIME_TOTAL_SPOTS} мест
              </p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-muted"
                  style={{ width: `${(LIFETIME_TAKEN_SPOTS / LIFETIME_TOTAL_SPOTS) * 100}%` }}
                />
              </div>
            </div>
          }
          locked
        />
      </div>

      <Card className="border-dashed">
        <CardContent className="flex items-start gap-2.5 p-5">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{BETA_NOTE}</p>
        </CardContent>
      </Card>
    </div>
  );
}

interface PlanFeature {
  ok: boolean;
  text: string;
}

function PlanCard({
  name,
  badge,
  active,
  highlight,
  description,
  price,
  priceSuffix,
  features,
  action,
  footer,
  locked,
}: {
  name: string;
  badge?: string;
  active?: boolean;
  highlight?: boolean;
  description: string;
  price: string;
  priceSuffix: string;
  features: PlanFeature[];
  action?: React.ReactNode;
  footer?: React.ReactNode;
  locked?: boolean;
}) {
  return (
    <Card
      className={cn(
        "relative flex h-full flex-col p-6",
        active && "ring-2",
        highlight && "z-10",
        locked && "opacity-95"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">{name}</h3>
        {badge && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
            {badge}
          </span>
        )}
      </div>

      <p className="mt-1 text-sm text-muted-foreground">{description}</p>

      {locked ? (
        <div className="mt-5">
          <Button disabled className="w-full">
            <Lock className="h-4 w-4" />
            Недоступно в бета
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">{BETA_NOTE}</p>
        </div>
      ) : (
        <div className="mt-5">{action}</div>
      )}

      <p className="mt-5 text-3xl font-bold">
        {price} <span className="text-base font-normal text-muted-foreground">{priceSuffix}</span>
      </p>

      <ul className="mt-5 flex-1 space-y-2.5 text-sm">
        {features.map((f) => (
          <li key={f.text} className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                f.ok ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
              )}
            >
              {f.ok ? <Check className="h-3.5 w-3.5" /> : "—"}
            </span>
            <span className={f.ok ? "text-foreground" : "text-muted-foreground line-through"}>{f.text}</span>
          </li>
        ))}
      </ul>

      {footer}
    </Card>
  );
}
