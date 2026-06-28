"use client";

import * as React from "react";
import { StudentFormDialog } from "@/components/forms/StudentFormDialog";
import { LessonFormDialog } from "@/components/forms/LessonFormDialog";
import { PaymentFormDialog } from "@/components/forms/PaymentFormDialog";
import { HomeworkFormDialog } from "@/components/forms/HomeworkFormDialog";
import { EventFormDialog } from "@/components/forms/EventFormDialog";
import { useData } from "@/context/DataProvider";
import { useSubscription } from "@/context/SubscriptionProvider";
import type { Homework, Lesson, Payment, Student, TutorEvent } from "@/lib/types";

interface QuickAddValue {
  openStudent: (student?: Student | null) => void;
  openLesson: (opts?: { lesson?: Lesson | null; defaultStudentId?: string }) => void;
  openPayment: (opts?: { payment?: Payment | null; defaultStudentId?: string }) => void;
  openHomework: (opts?: {
    homework?: Homework | null;
    defaultStudentId?: string;
    defaultLessonId?: string | null;
  }) => void;
  openEvent: (opts?: { event?: TutorEvent | null; defaultDate?: string }) => void;
}

const QuickAddContext = React.createContext<QuickAddValue | null>(null);

export function QuickAddProvider({ children }: { children: React.ReactNode }) {
  const { students } = useData();
  const { isPro, limit, showUpsell } = useSubscription();  const [student, setStudent] = React.useState<{ open: boolean; entity: Student | null }>({
    open: false,
    entity: null,
  });
  const [lesson, setLesson] = React.useState<{
    open: boolean;
    entity: Lesson | null;
    defaultStudentId?: string;
  }>({ open: false, entity: null });
  const [payment, setPayment] = React.useState<{
    open: boolean;
    entity: Payment | null;
    defaultStudentId?: string;
  }>({ open: false, entity: null });
  const [homework, setHomework] = React.useState<{
    open: boolean;
    entity: Homework | null;
    defaultStudentId?: string;
    defaultLessonId?: string | null;
  }>({ open: false, entity: null });
  const [event, setEvent] = React.useState<{
    open: boolean;
    entity: TutorEvent | null;
    defaultDate?: string;
  }>({ open: false, entity: null });

  const value = React.useMemo<QuickAddValue>(
    () => ({
      openStudent: (entity = null) => {
        if (!entity && !isPro && students.length >= limit) {
          showUpsell();
          return;
        }
        setStudent({ open: true, entity });
      },
      openLesson: (opts) =>
        setLesson({ open: true, entity: opts?.lesson ?? null, defaultStudentId: opts?.defaultStudentId }),
      openPayment: (opts) =>
        setPayment({ open: true, entity: opts?.payment ?? null, defaultStudentId: opts?.defaultStudentId }),
      openHomework: (opts) =>
        setHomework({
          open: true,
          entity: opts?.homework ?? null,
          defaultStudentId: opts?.defaultStudentId,
          defaultLessonId: opts?.defaultLessonId ?? null,
        }),
      openEvent: (opts) => {
        if (!opts?.event && !isPro) {
          showUpsell();
          return;
        }
        setEvent({ open: true, entity: opts?.event ?? null, defaultDate: opts?.defaultDate });
      },
    }),
    [isPro, students.length, limit, showUpsell]
  );

  return (
    <QuickAddContext.Provider value={value}>
      {children}
      <StudentFormDialog
        open={student.open}
        onOpenChange={(o) => setStudent((s) => ({ ...s, open: o }))}
        student={student.entity}
      />
      <LessonFormDialog
        open={lesson.open}
        onOpenChange={(o) => setLesson((s) => ({ ...s, open: o }))}
        lesson={lesson.entity}
        defaultStudentId={lesson.defaultStudentId}
      />
      <PaymentFormDialog
        open={payment.open}
        onOpenChange={(o) => setPayment((s) => ({ ...s, open: o }))}
        payment={payment.entity}
        defaultStudentId={payment.defaultStudentId}
      />
      <HomeworkFormDialog
        open={homework.open}
        onOpenChange={(o) => setHomework((s) => ({ ...s, open: o }))}
        homework={homework.entity}
        defaultStudentId={homework.defaultStudentId}
        defaultLessonId={homework.defaultLessonId}
      />
      <EventFormDialog
        open={event.open}
        onOpenChange={(o) => setEvent((s) => ({ ...s, open: o }))}
        event={event.entity}
        defaultDate={event.defaultDate}
      />
    </QuickAddContext.Provider>
  );
}

export function useQuickAdd(): QuickAddValue {
  const ctx = React.useContext(QuickAddContext);
  if (!ctx) throw new Error("useQuickAdd должен использоваться внутри <QuickAddProvider>");
  return ctx;
}
