"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useData } from "@/context/DataProvider";
import { useToast } from "@/context/ToastProvider";
import { homeworkSchema, type HomeworkFormValues } from "@/lib/validation";
import { HOMEWORK_STATUS_OPTIONS } from "@/lib/constants";
import { addDaysISO, todayISO } from "@/lib/utils/dates";
import type { Homework } from "@/lib/types";
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
  homework?: Homework | null;
  defaultStudentId?: string;
  defaultLessonId?: string | null;
}

export function HomeworkFormDialog({
  open,
  onOpenChange,
  homework,
  defaultStudentId,
  defaultLessonId = null,
}: Props) {
  const { students, addHomework, updateHomework } = useData();
  const { toast } = useToast();
  const isEdit = Boolean(homework);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<HomeworkFormValues>({
    resolver: zodResolver(homeworkSchema),
  });

  React.useEffect(() => {
    if (!open) return;
    reset(
      homework
        ? {
            student_id: homework.student_id,
            title: homework.title,
            description: homework.description,
            assigned_date: homework.assigned_date,
            due_date: homework.due_date,
            status: homework.status,
            comment: homework.comment,
          }
        : {
            student_id: defaultStudentId ?? "",
            title: "",
            description: "",
            assigned_date: todayISO(),
            due_date: addDaysISO(todayISO(), 3),
            status: "assigned",
            comment: "",
          }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, homework, defaultStudentId]);

  const onSubmit = async (values: HomeworkFormValues) => {
    try {
      if (isEdit && homework) {
        await updateHomework(homework.id, values);
        toast("Домашнее задание обновлено");
      } else {
        await addHomework({
          ...values,
          lesson_id: defaultLessonId,
          user_id: "",
        } as Omit<Homework, "id" | "created_at" | "updated_at">);
        toast("Домашнее задание добавлено");
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
          <DialogTitle>
            {isEdit ? "Редактировать задание" : "Новое домашнее задание"}
          </DialogTitle>
          <DialogDescription>Задание можно скопировать и отправить ученику.</DialogDescription>
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

            <Field label="Название" required error={errors.title?.message}>
              <Input placeholder="Например, Эссе на 250 слов" {...register("title")} />
            </Field>

            <Field label="Текст задания" error={errors.description?.message}>
              <Textarea rows={4} placeholder="Подробное описание задания" {...register("description")} />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Дата выдачи" required error={errors.assigned_date?.message}>
                <Input type="date" {...register("assigned_date")} />
              </Field>
              <Field label="Дедлайн" required error={errors.due_date?.message}>
                <Input type="date" {...register("due_date")} />
              </Field>
            </div>

            <Field label="Статус" error={errors.status?.message}>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <MenuSelect value={field.value} onChange={field.onChange} options={HOMEWORK_STATUS_OPTIONS} />
                )}
              />
            </Field>

            <Field label="Комментарий" error={errors.comment?.message}>
              <Textarea rows={2} placeholder="Заметки преподавателя" {...register("comment")} />
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
