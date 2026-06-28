"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ChevronRight } from "lucide-react";
import { parseISO } from "date-fns";
import { useData } from "@/context/DataProvider";
import { useQuickAdd } from "@/context/QuickAddProvider";
import type { Student } from "@/lib/types";
import { cn, formatCurrency, formatDate, initials } from "@/lib/utils";
import { LESSON_FORMAT_LABELS } from "@/lib/constants";
import { StudentStatusBadge } from "@/components/StatusBadge";
import { DebtBadge } from "@/components/DebtBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";

interface Props {
  students: Student[];
}

function lessonStats(studentId: string, lessons: { student_id: string; date: string; status: string }[]) {
  const mine = lessons.filter((l) => l.student_id === studentId);
  const past = mine
    .filter((l) => l.status !== "cancelled")
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const future = mine
    .filter((l) => (l.status === "scheduled" || l.status === "rescheduled") && parseISO(l.date) >= new Date(new Date().toDateString()))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  return { last: past[0] ?? null, next: future[0] ?? null };
}

export function StudentTable({ students }: Props) {
  const { lessons, studentDebt, removeStudent } = useData();
  const { openStudent } = useQuickAdd();
  const router = useRouter();
  const [toDelete, setToDelete] = React.useState<Student | null>(null);

  const handleDelete = async () => {
    if (!toDelete) return;
    await removeStudent(toDelete.id);
    setToDelete(null);
  };

  if (students.length === 0) return null;

  return (
    <>
      <div className="card card--flat overflow-hidden hidden md:block">
        <table className="tbl">
          <thead>
            <tr>
              <th>Ученик</th>
              <th>Предмет</th>
              <th>Цена</th>
              <th>Статус</th>
              <th>Долг</th>
              <th>Занятия</th>
              <th className="text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const { last, next } = lessonStats(s.id, lessons);
              return (
                <tr key={s.id} className="cursor-pointer" onClick={() => router.push(`/students/${s.id}`)}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar avatar--initials avatar--sm">{initials(s.name)}</div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{s.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {s.phone || s.email || LESSON_FORMAT_LABELS[s.lesson_format]}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted-foreground">{s.subject || "—"}</td>
                  <td>{formatCurrency(s.lesson_price, s.currency)}</td>
                  <td><StudentStatusBadge status={s.status} /></td>
                  <td><DebtBadge debt={studentDebt(s.id)} currency={s.currency} /></td>
                  <td className="text-xs text-muted-foreground">
                    {last && <p>Прошлое: {formatDate(last.date, "d MMM")}</p>}
                    {next && <p>Следующее: {formatDate(next.date, "d MMM")}</p>}
                    {!last && !next && <span>—</span>}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openStudent(s)} aria-label="Редактировать">
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setToDelete(s)}
                        aria-label="Удалить"
                        className="text-destructive"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="stack-3 md:hidden">
        {students.map((s) => {
          const { last, next } = lessonStats(s.id, lessons);
          return (
            <Link
              key={s.id}
              href={`/students/${s.id}`}
              className={cn("card card--flat p-3 flex items-center gap-3")}
            >
              <div className="avatar avatar--initials">{initials(s.name)}</div>
              <div className="min-w-0 grow">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium">{s.name}</p>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
                <p className="truncate text-xs text-muted-foreground">{s.subject || "Без предмета"}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  <StudentStatusBadge status={s.status} />
                  <DebtBadge debt={studentDebt(s.id)} currency={s.currency} />
                  <span className="text-xs text-muted-foreground">{formatCurrency(s.lesson_price, s.currency)}</span>
                </div>
                {(last || next) && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {next ? `След.: ${formatDate(next.date, "d MMM")}` : `Посл.: ${formatDate(last!.date, "d MMM")}`}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Удалить ученика?"
        description={`Ученик «${toDelete?.name}» и все связанные занятия, оплаты и домашние задания будут удалены безвозвратно.`}
        confirmText="Удалить"
        destructive
        onConfirm={handleDelete}
      />
    </>
  );
}
