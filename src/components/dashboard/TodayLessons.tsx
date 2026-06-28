"use client";

import * as React from "react";
import Link from "next/link";
import { Check, X, StickyNote, Wallet, CalendarOff } from "lucide-react";
import { useData } from "@/context/DataProvider";
import { useQuickAdd } from "@/context/QuickAddProvider";
import { useToast } from "@/context/ToastProvider";
import { getTodayLessons } from "@/lib/calc";
import { formatTime } from "@/lib/utils";
import type { Lesson } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { TimeBlock } from "@/components/ui/time-block";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function TodayLessons() {
  const { students, lessons, updateLesson } = useData();
  const { openLesson, openPayment } = useQuickAdd();
  const { toast } = useToast();

  const today = getTodayLessons(lessons);

  const student = (id: string) => students.find((s) => s.id === id);

  const setStatus = async (l: Lesson, status: Lesson["status"]) => {
    await updateLesson(l.id, { status });
    toast(status === "completed" ? "Занятие проведено" : "Занятие отменено");
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Сегодня</CardTitle>
        <CardDescription>{today.length > 0 ? `Занятий сегодня: ${today.length}` : "Занятий нет"}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        {today.length === 0 ? (
          <EmptyState
            icon={CalendarOff}
            title="На сегодня занятий нет"
            description="Запланируйте новое занятие, чтобы оно появилось здесь."
          />
        ) : (
          today.map((l) => {
            const s = student(l.student_id);
            return (
              <div
                key={l.id}
                className="flex flex-col gap-3 card card--flat p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <TimeBlock time={formatTime(l.start_time)} duration={l.duration_minutes} />
                  <div className="min-w-0">
                    <Link href={`/students/${l.student_id}`} className="block truncate font-medium hover:underline">
                      {s?.name ?? "Ученик"}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {l.topic || l.subject || s?.subject || "Занятие"}
                    </p>
                    <div className="mt-1"><StatusBadge kind="lesson" status={l.status} /></div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {l.status === "scheduled" && (
                    <>
                      <Button size="sm" variant="success" onClick={() => setStatus(l, "completed")}>
                        <Check className="h-4 w-4" />
                        Проведено
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setStatus(l, "cancelled")}>
                        <X className="h-4 w-4" />
                        Отменено
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => openPayment({ defaultStudentId: l.student_id })} title="Добавить оплату">
                    <Wallet className="h-4 w-4" />
                    Оплата
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openLesson({ lesson: l })} title="Добавить заметку">
                    <StickyNote className="h-4 w-4" />
                    Заметка
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
