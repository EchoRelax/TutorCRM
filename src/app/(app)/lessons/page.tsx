"use client";

import * as React from "react";
import { CalendarPlus, CalendarDays } from "lucide-react";
import {
  endOfWeek,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  isSameDay,
  parseISO,
} from "date-fns";
import { useData } from "@/context/DataProvider";
import { useQuickAdd } from "@/context/QuickAddProvider";
import { computePaidMap } from "@/lib/calc";
import { todayISO } from "@/lib/utils/dates";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MenuSelect } from "@/components/ui/menu-select";
import { LessonsTable } from "@/components/tables/LessonsTable";
import { EmptyState } from "@/components/EmptyState";
import { LESSON_STATUS_OPTIONS } from "@/lib/constants";
import type { LessonStatus } from "@/lib/types";

type Period = "today" | "week" | "month" | "all" | "custom";
type PayFilter = "all" | "paid" | "unpaid";

const now = () => new Date();

export default function LessonsPage() {
  const { lessons, payments, students, loading } = useData();
  const { openLesson } = useQuickAdd();

  const [period, setPeriod] = React.useState<Period>("all");
  const [from, setFrom] = React.useState<string>(todayISO());
  const [to, setTo] = React.useState<string>(todayISO());
  const [studentId, setStudentId] = React.useState<string>("all");
  const [status, setStatus] = React.useState<LessonStatus | "all">("all");
  const [pay, setPay] = React.useState<PayFilter>("all");

  const unpaidSet = React.useMemo(() => {
    const set = new Set<string>();
    for (const sid of new Set(lessons.map((l) => l.student_id))) {
      const m = computePaidMap(sid, lessons, payments);
      for (const [lid, paid] of m) if (!paid) set.add(lid);
    }
    return set;
  }, [lessons, payments]);

  const filtered = React.useMemo(() => {
    const n = now();
    return lessons
      .filter((l) => {
        const d = parseISO(l.date);
        if (period === "today" && !isSameDay(d, n)) return false;
        if (period === "week" && !isWithinInterval(d, { start: startOfWeek(n, { weekStartsOn: 1 }), end: endOfWeek(n, { weekStartsOn: 1 }) })) return false;
        if (period === "month" && !isWithinInterval(d, { start: startOfMonth(n), end: endOfMonth(n) })) return false;
        if (period === "custom") {
          const f = parseISO(from);
          const t = parseISO(to);
          if (!isWithinInterval(d, { start: f, end: t })) return false;
        }
        if (studentId !== "all" && l.student_id !== studentId) return false;
        if (status !== "all" && l.status !== status) return false;
        if (pay === "unpaid" && !(l.status === "completed" && unpaidSet.has(l.id))) return false;
        if (pay === "paid" && !(l.status === "completed" && !unpaidSet.has(l.id))) return false;
        return true;
      })
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.start_time < b.start_time ? 1 : -1));
  }, [lessons, period, from, to, studentId, status, pay, unpaidSet]);

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader
        title="Занятия"
        description={`Всего записей: ${lessons.length}`}
        actions={
          <Button onClick={() => openLesson()}>
            <CalendarPlus className="h-4 w-4" />
            Добавить занятие
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <MenuSelect
          value={period}
          onChange={(v) => setPeriod(v as Period)}
          options={[
            { value: "all", label: "За всё время" },
            { value: "today", label: "Сегодня" },
            { value: "week", label: "Эта неделя" },
            { value: "month", label: "Этот месяц" },
            { value: "custom", label: "Произвольный период" },
          ]}
        />
        {period === "custom" ? (
          <>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </>
        ) : (
          <>
            <MenuSelect
              value={studentId}
              onChange={setStudentId}
              options={[
                { value: "all", label: "Все ученики" },
                ...students.map((s) => ({ value: s.id, label: s.name })),
              ]}
            />
            <MenuSelect
              value={status}
              onChange={(v) => setStatus(v as LessonStatus | "all")}
              options={[{ value: "all", label: "Любой статус" }, ...LESSON_STATUS_OPTIONS]}
            />
          </>
        )}
        <MenuSelect
          value={pay}
          onChange={(v) => setPay(v as PayFilter)}
          options={[
            { value: "all", label: "Любая оплата" },
            { value: "paid", label: "Оплачено" },
            { value: "unpaid", label: "Не оплачено" },
          ]}
        />
      </div>

      {loading ? null : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Занятий не найдено"
          description={
            lessons.length === 0
              ? "Добавьте первое занятие, чтобы оно появилось в списке."
              : "Попробуйте изменить фильтры."
          }
          action={
            lessons.length === 0 ? (
              <Button onClick={() => openLesson()}>
                <CalendarPlus className="h-4 w-4" />
                Добавить занятие
              </Button>
            ) : undefined
          }
        />
      ) : (
        <LessonsTable lessons={filtered} />
      )}
    </div>
  );
}
