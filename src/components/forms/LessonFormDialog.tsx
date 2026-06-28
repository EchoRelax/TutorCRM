"use client";

import * as React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useData } from "@/context/DataProvider";
import { useToast } from "@/context/ToastProvider";
import { lessonSchema, type LessonFormValues } from "@/lib/validation";
import { LESSON_STATUS_OPTIONS } from "@/lib/constants";
import { todayISO } from "@/lib/utils/dates";
import type { Lesson } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MenuSelect } from "@/components/ui/menu-select";
import { Field } from "@/components/ui/field";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson?: Lesson | null;
  defaultStudentId?: string;
}

export function LessonFormDialog({ open, onOpenChange, lesson, defaultStudentId }: Props) {
  const { students, addLesson, updateLesson, profile } = useData();
  const { toast } = useToast();
  const isEdit = Boolean(lesson);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
  });

  const studentId = useWatch({ control, name: "student_id" });
  React.useEffect(() => {
    if (!isEdit && studentId) {
      const s = students.find((x) => x.id === studentId);
      if (s) {
        setValue("price", s.lesson_price);
        if (s.subject) setValue("subject", s.subject);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, students, isEdit]);

  React.useEffect(() => {
    if (!open) return;
    reset(
      lesson
        ? {
            student_id: lesson.student_id,
            date: lesson.date,
            start_time: lesson.start_time,
            duration_minutes: lesson.duration_minutes,
            subject: lesson.subject,
            topic: lesson.topic,
            price: lesson.price,
            status: lesson.status,
            notes: lesson.notes,
          }
        : {
            student_id: defaultStudentId ?? "",
            date: todayISO(),
            start_time: "10:00",
            duration_minutes: profile?.default_lesson_duration ?? 60,
            subject: "",
            topic: "",
            price:
              students.find((x) => x.id === (defaultStudentId ?? ""))?.lesson_price ??
              profile?.default_lesson_price ??
              0,
            status: "scheduled",
            notes: "",
          }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lesson, defaultStudentId]);

  const onSubmit = async (values: LessonFormValues) => {
    try {
      if (isEdit && lesson) {
        await updateLesson(lesson.id, values);
        toast("Занятие обновлено");
      } else {
        await addLesson({ ...values, user_id: "" } as Omit<Lesson, "id" | "created_at" | "updated_at">);
        toast("Занятие добавлено");
      }
      onOpenChange(false);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Не удалось сохранить", "error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onOpenChange={onOpenChange}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Редактировать занятие" : "Новое занятие"}</DialogTitle>
          <DialogDescription>Назначьте занятие ученику.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody className="space-y-4">
            <Field label="Ученик" required error={errors.student_id?.message}>
              <Controller
                control={control}
                name="student_id"
                render={({ field }) => (
                  <MenuSelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Выберите ученика"
                    options={students.map((s) => ({ value: s.id, label: s.name }))}
                  />
                )}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Дата" required error={errors.date?.message}>
                <Input type="date" {...register("date")} />
              </Field>
              <Field label="Время начала" required error={errors.start_time?.message}>
                <Input type="time" {...register("start_time")} />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Длительность (мин)" required error={errors.duration_minutes?.message}>
                <Input type="number" min={1} step={1} {...register("duration_minutes")} />
              </Field>
              <Field label="Цена" required error={errors.price?.message}>
                <Input type="number" min={0} step="any" {...register("price")} />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Предмет" error={errors.subject?.message}>
                <Input placeholder="Английский" {...register("subject")} />
              </Field>
              <Field label="Статус" error={errors.status?.message}>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <MenuSelect value={field.value} onChange={field.onChange} options={LESSON_STATUS_OPTIONS} />
                  )}
                />
              </Field>
            </div>

            <Field label="Тема занятия" error={errors.topic?.message}>
              <Input placeholder="Например, Present Perfect" {...register("topic")} />
            </Field>

            <Field label="Комментарий" error={errors.notes?.message}>
              <Textarea rows={2} placeholder="Заметки по занятию" {...register("notes")} />
            </Field>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Сохранить" : "Добавить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
