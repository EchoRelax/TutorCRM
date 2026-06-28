"use client";

import * as React from "react";
import { Check, Sparkles, Wrench, Infinity as InfinityIcon } from "lucide-react";
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

export default function SubscriptionPage() {
  const { plan, isPro, isLifetime, setPlan, grantPro, grantLifetime, revokePro } = useSubscription();
  const { toast } = useToast();
  const spotsLeft = Math.max(0, LIFETIME_TOTAL_SPOTS - LIFETIME_TAKEN_SPOTS);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Подписка"
        description={
          isLifetime
            ? "Ваш тариф: Lifetime"
            : isPro
              ? "Ваш тариф: Pro"
              : `Ваш тариф: Free (до ${FREE_STUDENT_LIMIT} учеников)`
        }
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

        {/* Pro — выделен размером */}
        <PlanCard
          name="Pro"
          badge="Популярное"
          active={plan === "pro"}
          highlight
          description="Для активной практики без ограничений"
          price={formatCurrency(490)}
          priceSuffix="/ мес"
          features={PRO_FEATURES.map((text) => ({ ok: true, text }))}
          action={
            plan === "pro" ? (
              <Button variant="outline" className="w-full" disabled>
                Pro активна
              </Button>
            ) : (
              <Button onClick={() => { grantPro(); toast("Добро пожаловать в Pro!"); }} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Sparkles className="h-4 w-4" />
                Перейти на Pro
              </Button>
            )
          }
        />

        {/* Lifetime */}
        <PlanCard
          name="Lifetime"
          badge="Лимитированное"
          badgeTone="amber"
          active={plan === "lifetime"}
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
              <p className="text-xs font-medium text-warning">
                Осталось {spotsLeft} из {LIFETIME_TOTAL_SPOTS} мест
              </p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-warning"
                  style={{ width: `${(LIFETIME_TAKEN_SPOTS / LIFETIME_TOTAL_SPOTS) * 100}%` }}
                />
              </div>
            </div>
          }
          action={
            plan === "lifetime" ? (
              <Button variant="outline" className="w-full" disabled>
                Lifetime активна
              </Button>
            ) : (
              <Button onClick={() => { grantLifetime(); toast("Lifetime активирована!"); }} className="w-full bg-warning text-warning-foreground hover:bg-warning/90">
                <InfinityIcon className="h-4 w-4" />
                Забрать Lifetime
              </Button>
            )
          }
        />
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <Wrench className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Отладка</p>
              <p className="text-xs text-muted-foreground">
                Тестовые кнопки тарифа (временно, для проверки).
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => { setPlan("pro"); toast("Pro включён (отладка)"); }}>
              Выдать Pro
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setPlan("lifetime"); toast("Lifetime включён (отладка)"); }}>
              Выдать Lifetime
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setPlan("free"); toast("Free включён (отладка)"); }}>
              Сбросить на Free
            </Button>
          </div>
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
  badgeTone,
  active,
  highlight,
  description,
  price,
  priceSuffix,
  features,
  action,
  footer,
}: {
  name: string;
  badge?: string;
  badgeTone?: "amber";
  active?: boolean;
  highlight?: boolean;
  description: string;
  price: string;
  priceSuffix: string;
  features: PlanFeature[];
  action: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        "relative flex h-full flex-col p-6",
        active && "ring-2",
        highlight && "z-10"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">{name}</h3>
        {badge && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-sm",
              badgeTone === "amber"
                ? "bg-warning text-warning-foreground"
                : "bg-primary text-primary-foreground"
            )}
          >
            {badge}
          </span>
        )}
      </div>

      <p className="mt-1 text-sm text-muted-foreground">{description}</p>

      <div className="mt-5">{action}</div>

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
