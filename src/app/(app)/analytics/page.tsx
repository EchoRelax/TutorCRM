"use client";

import * as React from "react";
import { BarChart3, TrendingUp, Wallet, CheckCircle2, Users } from "lucide-react";
import { format, isSameMonth, parseISO, subMonths } from "date-fns";
import { ru } from "date-fns/locale";
import { useData } from "@/context/DataProvider";
import { getStudentCompletedTotal, getStudentDebt } from "@/lib/calc";
import { LESSON_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency, initials, pluralize } from "@/lib/utils";
import type { LessonStatus } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { ExportMenu } from "@/components/ExportMenu";
import { LESSON_STATUS_LABELS as STATUS_LABELS } from "@/lib/constants";
import type { ReportData } from "@/lib/exporters";
import { animate, stagger } from "animejs";

const STATUS_ORDER: LessonStatus[] = ["completed", "scheduled", "cancelled", "rescheduled"];

export default function AnalyticsPage() {
  const { students, lessons, payments, profile } = useData();
  const currency = profile?.default_currency ?? "RUB";

  const totalIncome = payments.reduce((s, p) => s + p.amount, 0);
  const completedLessons = lessons.filter((l) => l.status === "completed");
  const avgPrice = completedLessons.length
    ? completedLessons.reduce((s, l) => s + l.price, 0) / completedLessons.length
    : 0;
  const activeCount = students.filter((s) => s.status === "active").length;

  const byMonth = React.useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const m = subMonths(now, 5 - i);
      const sum = payments
        .filter((p) => isSameMonth(parseISO(p.payment_date), m))
        .reduce((s, p) => s + p.amount, 0);
      return { label: format(m, "LLL", { locale: ru }), sum };
    });
  }, [payments]);
  const maxMonth = Math.max(1, ...byMonth.map((m) => m.sum));

  const byStatus = React.useMemo(() => {
    const counts: Record<LessonStatus, number> = {
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      rescheduled: 0,
    };
    for (const l of lessons) counts[l.status]++;
    return counts;
  }, [lessons]);
  const maxStatus = Math.max(1, ...Object.values(byStatus));

  const topStudents = React.useMemo(() => {
    return students
      .map((s) => ({
        student: s,
        revenue: getStudentCompletedTotal(s.id, lessons),
        debt: getStudentDebt(s.id, lessons, payments),
      }))
      .filter((r) => r.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [students, lessons, payments]);

  const report: ReportData = React.useMemo(
    () => ({
      title: "Аналитика Lumen",
      generatedAt: format(new Date(), "d MMMM yyyy, HH:mm", { locale: ru }),
      kpis: [
        { label: "Суммарный доход", value: formatCurrency(totalIncome, currency) },
        { label: "Средняя цена занятия", value: formatCurrency(avgPrice, currency) },
        { label: "Проведено занятий", value: String(completedLessons.length) },
        { label: "Активных учеников", value: String(activeCount) },
      ],
      sections: [
        {
          title: "Доход по месяцам",
          columns: ["Месяц", "Доход"],
          rows: byMonth.map((m) => [m.label, formatCurrency(m.sum, currency)]),
        },
        {
          title: "Занятия по статусам",
          columns: ["Статус", "Количество"],
          rows: STATUS_ORDER.map((s) => [STATUS_LABELS[s], String(byStatus[s])]),
        },
        {
          title: "Топ учеников по доходу",
          columns: ["Ученик", "Предмет", "Доход", "Долг"],
          rows: topStudents.map(({ student, revenue, debt }) => [
            student.name,
            student.subject || "—",
            formatCurrency(revenue, student.currency),
            debt > 0 ? formatCurrency(debt, student.currency) : "—",
          ]),
        },
      ],
    }),
    [totalIncome, avgPrice, currency, completedLessons.length, activeCount, byMonth, byStatus, topStudents]
  );

  const monthBarRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const statusBarRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    const bars = monthBarRefs.current.filter(Boolean) as HTMLDivElement[];
    if (bars.length) {
      animate(bars, {
        scaleY: [0, 1],
        duration: 750,
        delay: stagger(70),
        ease: "out(3)",
      });
    }
    const fills = statusBarRefs.current.filter(Boolean) as HTMLDivElement[];
    if (fills.length) {
      animate(fills, {
        scaleX: [0, 1],
        duration: 750,
        delay: stagger(90),
        ease: "out(3)",
      });
    }
  }, [byMonth, byStatus]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Аналитика"
        description="Сводка по доходам, занятиям и ученикам"
        actions={<ExportMenu report={report} />}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Суммарный доход" value={formatCurrency(totalIncome, currency)} icon={Wallet} tone="success" />
        <StatCard label="Средняя цена занятия" value={formatCurrency(avgPrice, currency)} icon={TrendingUp} tone="primary" />
        <StatCard label="Проведено занятий" value={completedLessons.length} icon={CheckCircle2} tone="primary" />
        <StatCard label="Активных учеников" value={activeCount} icon={Users} tone="primary" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="animate-fade-in-up h-full p-5">
          <CardHeader className="flex-row items-center justify-between space-y-0 p-0">
            <CardTitle className="text-base">Доход по месяцам</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0 pt-5">
            <div className="flex h-44 items-end justify-between gap-2">
              {byMonth.map((m, i) => (
                <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      ref={(el) => {
                        monthBarRefs.current[i] = el;
                      }}
                      className="w-full rounded-t-md bg-primary/80 transition-colors hover:bg-primary"
                      style={{
                        height: `${(m.sum / maxMonth) * 100}%`,
                        minHeight: m.sum > 0 ? 4 : 2,
                        transformOrigin: "bottom",
                        transform: "scaleY(0)",
                      }}
                      title={formatCurrency(m.sum, currency)}
                    />
                  </div>
                  <span className="text-[11px] text-muted-foreground">{m.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up h-full p-5">
          <CardHeader className="flex-row items-center justify-between space-y-0 p-0">
            <CardTitle className="text-base">Занятия по статусам</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3 p-0 pt-5">
            {STATUS_ORDER.map((s, i) => (
              <div key={s} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <StatusBadge kind="lesson" status={s} />
                  <span className="font-medium">
                    {byStatus[s]} {pluralize(byStatus[s], ["занятие", "занятия", "занятий"])}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    ref={(el) => {
                      statusBarRefs.current[i] = el;
                    }}
                    className="h-full rounded-full bg-primary/70"
                    style={{
                      width: `${(byStatus[s] / maxStatus) * 100}%`,
                      transformOrigin: "left",
                      transform: "scaleX(0)",
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-in-up h-full p-5">
        <CardHeader className="p-0">
          <CardTitle className="text-base">Топ учеников по доходу</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          {topStudents.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Пока нет данных.</p>
          ) : (
            <div className="space-y-2">
              {topStudents.map(({ student, revenue, debt }, i) => (
                <div key={student.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                  <span className="w-4 text-center text-sm font-semibold text-muted-foreground">{i + 1}</span>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                    {initials(student.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{student.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{student.subject || "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-success">{formatCurrency(revenue, student.currency)}</p>
                    {debt > 0 && <p className="text-xs text-destructive">долг {formatCurrency(debt, student.currency)}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
