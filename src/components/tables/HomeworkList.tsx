"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Copy, CalendarCheck, AlarmClock, ChevronRight } from "lucide-react";
import { parseISO } from "date-fns";
import { useData } from "@/context/DataProvider";
import { useQuickAdd } from "@/context/QuickAddProvider";
import { useToast } from "@/context/ToastProvider";
import type { Homework } from "@/lib/types";
import { HOMEWORK_MESSAGE_TEMPLATE } from "@/lib/constants";
import { copyToClipboard, formatDate } from "@/lib/utils";
import { HomeworkStatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";

interface Props {
  homework: Homework[];
  showStudent?: boolean;
}

export function HomeworkList({ homework, showStudent = true }: Props) {
  const { students, removeHomework } = useData();
  const { openHomework } = useQuickAdd();
  const { toast } = useToast();
  const router = useRouter();
  const [toDelete, setToDelete] = React.useState<Homework | null>(null);

  const studentName = (id: string) => students.find((s) => s.id === id)?.name ?? "—";

  const today = new Date(new Date().toDateString());
  const isOverdue = (h: Homework) =>
    h.status !== "completed" && parseISO(h.due_date) < today;

  const handleCopy = async (h: Homework) => {
    const text = HOMEWORK_MESSAGE_TEMPLATE(
      h.description || h.title,
      formatDate(h.due_date, "d MMM yyyy")
    );
    const ok = await copyToClipboard(text);
    toast(ok ? "Сообщение скопировано" : "Не удалось скопировать", ok ? "success" : "error");
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    await removeHomework(toDelete.id);
    setToDelete(null);
  };

  if (homework.length === 0) return null;

  return (
    <>
      <div className="space-y-2">
        {homework.map((h) => {
          const overdue = isOverdue(h);
          return (
            <div
              key={h.id}
              onClick={() => router.push(`/homework/${h.id}`)}
              className="group card card--flat card--hover p-3 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium group-hover:text-primary">{h.title}</p>
                    <HomeworkStatusBadge status={h.status} />
                  </div>
                  {showStudent && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{studentName(h.student_id)}</p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm" onClick={() => handleCopy(h)} className="hidden sm:inline-flex">
                    <Copy className="h-4 w-4" />
                    Скопировать
                  </Button>
                  <Button variant="outline" size="icon-sm" onClick={() => handleCopy(h)} className="sm:hidden" aria-label="Скопировать">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => openHomework({ homework: h })} aria-label="Редактировать">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setToDelete(h)} className="text-destructive hover:text-destructive" aria-label="Удалить">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <ChevronRight className="ml-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {h.description && (
                <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{h.description}</p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="muted" className="gap-1">
                  <CalendarCheck className="h-3 w-3" />
                  Выдано: {formatDate(h.assigned_date, "d MMM")}
                </Badge>
                <Badge variant={overdue ? "destructive" : "warning"} className="gap-1">
                  <AlarmClock className="h-3 w-3" />
                  Дедлайн: {formatDate(h.due_date, "d MMM yyyy")}
                  {overdue && " · просрочено"}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Удалить задание?"
        description="Домашнее задание будет удалено безвозвратно."
        confirmText="Удалить"
        destructive
        onConfirm={handleDelete}
      />
    </>
  );
}
