"use client";

import * as React from "react";
import { parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { format } from "date-fns";
import { Check, X, Pencil, Trash2 } from "lucide-react";
import { useData } from "@/context/DataProvider";
import { useQuickAdd } from "@/context/QuickAddProvider";
import { useToast } from "@/context/ToastProvider";
import { computePaidMap } from "@/lib/calc";
import type { Lesson } from "@/lib/types";
import { formatCurrency, formatTime } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TimeBlock } from "@/components/ui/time-block";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Props {
  lessons: Lesson[];
  currency: (studentId: string) => import("@/lib/types").Currency;
}

export function LessonTimeline({ lessons, currency }: Props) {
  const { lessons: allLessons, payments: allPayments, removeLesson, updateLesson } = useData();
  const { openLesson } = useQuickAdd();
  const { toast } = useToast();
  const [toDelete, setToDelete] = React.useState<Lesson | null>(null);

  const paidMap = React.useMemo(
    () => (lessons[0] ? computePaidMap(lessons[0].student_id, allLessons, allPayments) : new Map<string, boolean>()),
    [lessons, allLessons, allPayments]
  );

  const quickStatus = async (l: Lesson, status: Lesson["status"]) => {
    await updateLesson(l.id, { status });
    toast(status === "completed" ? "Отмечено как проведённое" : "Занятие отменено");
  };

  const sorted = React.useMemo(
    () => [...lessons].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.start_time < b.start_time ? 1 : -1)),
    [lessons]
  );

  return (
    <>
      <div className="stack-2">
        {sorted.map((l) => {
          const d = parseISO(l.date);
          const paid = l.status === "completed" ? paidMap.get(l.id) : undefined;
          return (
            <div key={l.id} className="card card--flat card--hover p-2 flex flex-wrap items-center gap-3">
              <div className="timeblock" style={{ width: 48 }}>
                <span className="timeblock-time">{format(d, "d")}</span>
                <span className="timeblock-sub uppercase">{format(d, "MMM", { locale: ru })}</span>
              </div>

              <TimeBlock time={formatTime(l.start_time)} duration={l.duration_minutes} />

              <div className="min-w-0 grow">
                <p className="truncate text-sm font-medium">{l.topic || l.subject || "Занятие"}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  <StatusBadge kind="lesson" status={l.status} />
                  {paid !== undefined &&
                    (paid ? (
                      <Badge variant="success">Оплачено</Badge>
                    ) : (
                      <Badge variant="destructive">Долг</Badge>
                    ))}
                </div>
              </div>

              <span className="shrink-0 text-sm font-medium">{formatCurrency(l.price, currency(l.student_id))}</span>

              <div className="flex shrink-0 items-center gap-1">
                {l.status === "scheduled" && (
                  <>
                    <Button variant="ghost" size="icon-sm" className="text-success" onClick={() => quickStatus(l, "completed")} title="Проведено">
                      <Check />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => quickStatus(l, "cancelled")} title="Отменить">
                      <X />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="icon-sm" onClick={() => openLesson({ lesson: l })} aria-label="Редактировать">
                  <Pencil />
                </Button>
                <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => setToDelete(l)} aria-label="Удалить">
                  <Trash2 />
                </Button>
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
        onConfirm={async () => {
          if (!toDelete) return;
          await removeLesson(toDelete.id);
          setToDelete(null);
        }}
      />
    </>
  );
}
