"use client";

import * as React from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { useData } from "@/context/DataProvider";
import { useQuickAdd } from "@/context/QuickAddProvider";
import { useToast } from "@/context/ToastProvider";
import type { Lesson } from "@/lib/types";
import { computePaidMap } from "@/lib/calc";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { TimeBlock } from "@/components/ui/time-block";

interface Props {
  lessons: Lesson[];
  showStudent?: boolean;
}

export function LessonsTable({ lessons, showStudent = true }: Props) {
  const {
    students,
    lessons: allLessons,
    payments: allPayments,
    removeLesson,
    updateLesson,
  } = useData();
  const { openLesson } = useQuickAdd();
  const { toast } = useToast();
  const [toDelete, setToDelete] = React.useState<Lesson | null>(null);

  const studentName = (id: string) => students.find((s) => s.id === id)?.name ?? "—";
  const studentCurrency = (id: string) => students.find((s) => s.id === id)?.currency ?? "RUB";

  const paidMaps = React.useMemo(() => {
    const m = new Map<string, Map<string, boolean>>();
    for (const id of new Set(lessons.map((l) => l.student_id))) {
      m.set(id, computePaidMap(id, allLessons, allPayments));
    }
    return m;
  }, [lessons, allLessons, allPayments]);

  const quickStatus = async (lesson: Lesson, status: Lesson["status"]) => {
    await updateLesson(lesson.id, { status });
    toast(status === "completed" ? "Отмечено как проведённое" : "Занятие отменено");
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    await removeLesson(toDelete.id);
    setToDelete(null);
  };

  if (lessons.length === 0) return null;

  return (
    <>
      <div className="card card--flat overflow-hidden hidden md:block">
        <table className="tbl">
          <thead>
            <tr>
              <th>Дата</th>
              {showStudent && <th>Ученик</th>}
              <th>Тема</th>
              <th>Длит.</th>
              <th>Цена</th>
              <th>Статус</th>
              <th>Оплата</th>
              <th className="text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((l) => {
              const paid = l.status === "completed" ? paidMaps.get(l.student_id)?.get(l.id) : undefined;
              return (
                <tr key={l.id}>
                  <td className="nowrap">
                    <div className="font-medium">{formatDate(l.date, "d MMM")}</div>
                    <div className="text-xs text-muted-foreground">{formatTime(l.start_time)}</div>
                  </td>
                  {showStudent && <td className="font-medium">{studentName(l.student_id)}</td>}
                  <td className="text-muted-foreground">
                    <div className="truncate" style={{ maxWidth: 180 }}>{l.topic || l.subject || "—"}</div>
                  </td>
                  <td className="text-muted-foreground">{l.duration_minutes} мин</td>
                  <td>{formatCurrency(l.price, studentCurrency(l.student_id))}</td>
                  <td><StatusBadge kind="lesson" status={l.status} /></td>
                  <td>
                    {paid === undefined ? (
                      <Badge variant="muted">—</Badge>
                    ) : paid ? (
                      <Badge variant="success">Оплачено</Badge>
                    ) : (
                      <Badge variant="destructive">Долг</Badge>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      {l.status === "scheduled" && (
                        <>
                          <Button variant="ghost" size="icon-sm" onClick={() => quickStatus(l, "completed")} className="text-success" title="Проведено">
                            <Check />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => quickStatus(l, "cancelled")} className="text-destructive" title="Отменено">
                            <X />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon-sm" onClick={() => openLesson({ lesson: l })} aria-label="Редактировать">
                        <Pencil />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setToDelete(l)} className="text-destructive" aria-label="Удалить">
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

      <div className="stack-2 md:hidden">
        {lessons.map((l) => {
          const paid = l.status === "completed" ? paidMaps.get(l.student_id)?.get(l.id) : undefined;
          return (
            <div key={l.id} className="card card--flat p-3">
              <div className="flex items-start gap-3">
                <TimeBlock time={formatTime(l.start_time)} duration={l.duration_minutes} />
                <div className="min-w-0 grow">
                  <p className="font-medium">{formatDate(l.date, "d MMM yyyy")}</p>
                  {showStudent && <p className="text-sm text-muted-foreground">{studentName(l.student_id)}</p>}
                  <p className="truncate text-xs text-muted-foreground">{l.topic || l.subject || "Без темы"}</p>
                  <div className="mt-1"><StatusBadge kind="lesson" status={l.status} /></div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">{formatCurrency(l.price, studentCurrency(l.student_id))}</span>
                  {paid !== undefined && (paid ? <Badge variant="success">Оплачено</Badge> : <Badge variant="destructive">Долг</Badge>)}
                </div>
                <div className="flex items-center gap-1">
                  {l.status === "scheduled" && (
                    <>
                      <Button variant="ghost" size="icon-sm" onClick={() => quickStatus(l, "completed")} className="text-success">
                        <Check />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => quickStatus(l, "cancelled")} className="text-destructive">
                        <X />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="icon-sm" onClick={() => openLesson({ lesson: l })}>
                    <Pencil />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setToDelete(l)} className="text-destructive">
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Удалить занятие?"
        description="Занятие будет удалено безвозвратно."
        confirmText="Удалить"
        destructive
        onConfirm={handleDelete}
      />
    </>
  );
}
