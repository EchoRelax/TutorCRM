"use client";

import * as React from "react";
import { Search, UserPlus, Users as UsersIcon, AlertTriangle } from "lucide-react";
import { parseISO } from "date-fns";
import { useData } from "@/context/DataProvider";
import { getStudentDebt } from "@/lib/calc";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MenuSelect } from "@/components/ui/menu-select";
import { StudentTable } from "@/components/tables/StudentTable";
import { EmptyState } from "@/components/EmptyState";
import { useQuickAdd } from "@/context/QuickAddProvider";
import { STUDENT_STATUS_LABELS } from "@/lib/constants";
import type { StudentStatus } from "@/lib/types";

type Filter = "all" | StudentStatus;
type Sort = "name" | "debt" | "price" | "recent";

const SORT_OPTIONS = [
  { value: "name", label: "По имени" },
  { value: "debt", label: "По долгу" },
  { value: "price", label: "По цене занятия" },
  { value: "recent", label: "По последнему занятию" },
];

export default function StudentsPage() {
  const { students, lessons, payments, loading } = useData();
  const { openStudent } = useQuickAdd();

  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<Filter>("all");
  const [subject, setSubject] = React.useState<string>("all");
  const [debtOnly, setDebtOnly] = React.useState(false);
  const [sort, setSort] = React.useState<Sort>("name");

  const subjects = React.useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => s.subject && set.add(s.subject));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ru"));
  }, [students]);

  const filtered = React.useMemo(() => {
    let list = [...students];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.subject?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.phone?.toLowerCase().includes(q)
      );
    }
    if (filter !== "all") list = list.filter((s) => s.status === filter);
    if (subject !== "all") list = list.filter((s) => s.subject === subject);
    if (debtOnly) list = list.filter((s) => getStudentDebt(s.id, lessons, payments) > 0);

    list.sort((a, b) => {
      if (sort === "debt")
        return getStudentDebt(b.id, lessons, payments) - getStudentDebt(a.id, lessons, payments);
      if (sort === "price") return b.lesson_price - a.lesson_price;
      if (sort === "recent") {
        const last = (id: string) => {
          const dates = lessons
            .filter((l) => l.student_id === id && l.status !== "cancelled")
            .map((l) => l.date)
            .sort();
          return dates.length ? parseISO(dates[dates.length - 1]).getTime() : 0;
        };
        return last(b.id) - last(a.id);
      }
      return a.name.localeCompare(b.name, "ru");
    });
    return list;
  }, [students, query, filter, subject, debtOnly, sort, lessons, payments]);

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader
        title="Ученики"
        description={`Всего учеников: ${students.length}`}
        actions={
          <Button onClick={() => openStudent()}>
            <UserPlus className="h-4 w-4" />
            Добавить ученика
          </Button>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени, предмету, контакту..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <MenuSelect
          value={filter}
          onChange={(v) => setFilter(v as Filter)}
          className="sm:w-40"
          options={[
            { value: "all", label: "Все статусы" },
            ...(Object.keys(STUDENT_STATUS_LABELS) as StudentStatus[]).map((s) => ({
              value: s,
              label: STUDENT_STATUS_LABELS[s],
            })),
          ]}
        />
        <MenuSelect
          value={subject}
          onChange={setSubject}
          className="sm:w-40"
          options={[{ value: "all", label: "Все предметы" }, ...subjects.map((s) => ({ value: s, label: s }))]}
        />
        <MenuSelect value={sort} onChange={(v) => setSort(v as Sort)} className="sm:w-48" options={SORT_OPTIONS} />
        <Button
          variant={debtOnly ? "default" : "outline"}
          onClick={() => setDebtOnly((v) => !v)}
          className="sm:w-auto"
        >
          <AlertTriangle className="h-4 w-4" />
          С долгом
        </Button>
      </div>

      {loading ? null : filtered.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title={students.length === 0 ? "Пока нет учеников" : "Ничего не найдено"}
          description={
            students.length === 0
              ? "Добавьте первого ученика, чтобы начать вести занятия и оплаты."
              : "Попробуйте изменить поиск или фильтр."
          }
          action={
            students.length === 0 ? (
              <Button onClick={() => openStudent()}>
                <UserPlus className="h-4 w-4" />
                Добавить ученика
              </Button>
            ) : undefined
          }
        />
      ) : (
        <StudentTable students={filtered} />
      )}
    </div>
  );
}
