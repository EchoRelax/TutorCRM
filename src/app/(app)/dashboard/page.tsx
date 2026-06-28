"use client";

import * as React from "react";
import { Users, CalendarDays, Wallet, Loader2, Sparkles } from "lucide-react";
import { useData } from "@/context/DataProvider";
import {
  getActiveStudents,
  getMonthlyIncome,
  getTodayLessons,
} from "@/lib/calc";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/StatCard";
import { QuickActions } from "@/components/QuickActions";
import { TodayLessons } from "@/components/dashboard/TodayLessons";
import { DebtorsBlock } from "@/components/dashboard/DebtorsBlock";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const { students, lessons, payments, profile, loading } = useData();

  const currency = profile?.default_currency ?? "RUB";
  const activeCount = getActiveStudents(students).length;
  const todayCount = getTodayLessons(lessons).length;
  const income = getMonthlyIncome(payments);
  const totalIncome = payments.reduce((s, p) => s + p.amount, 0);
  const monthLabel = format(new Date(), "MMMM", { locale: ru });
  const hour = new Date().getHours();
  const greeting = hour < 6 ? "Доброй ночи" : hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";
  const firstName = (profile?.full_name || "").split(" ")[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="greeting">
        <p className="greeting-date">{format(new Date(), "EEEE, d MMMM", { locale: ru })}</p>
        <h1 className="greeting-title">
          {greeting}
          {firstName ? `, ${firstName}` : ""}
        </h1>
      </div>

      <div className="grid-stats">
        <StatCard label="Активные ученики" value={activeCount} icon={Users} tone="primary" />
        <StatCard label="Занятий сегодня" value={todayCount} icon={CalendarDays} tone="primary" />
        <StatCard
          label={`Доход за ${monthLabel}`}
          value={formatCurrency(income, currency)}
          icon={Wallet}
          tone="success"
        />
        <StatCard
          label="Общий доход"
          value={formatCurrency(totalIncome, currency)}
          icon={Wallet}
          tone="success"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Быстрые действия
            </CardTitle>
            <CardDescription>Добавьте данные в один клик</CardDescription>
          </CardHeader>
          <CardContent>
            <QuickActions />
          </CardContent>
        </Card>

        <div className="lg:row-span-2">
          <DebtorsBlock />
        </div>

        <div className="lg:col-span-2">
          <TodayLessons />
        </div>
      </div>
    </div>
  );
}
