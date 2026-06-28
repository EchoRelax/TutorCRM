"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useData } from "@/context/DataProvider";
import { useToast } from "@/context/ToastProvider";
import { studentSchema, type StudentFormValues } from "@/lib/validation";
import {
  CURRENCY_OPTIONS,
  LESSON_FORMAT_OPTIONS,
  STUDENT_STATUS_OPTIONS,
} from "@/lib/constants";
import type { Student } from "@/lib/types";
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
  student?: Student | null;
}

export function StudentFormDialog({ open, onOpenChange, student }: Props) {
  const { addStudent, updateStudent, profile } = useData();
  const { toast } = useToast();
  const isEdit = Boolean(student);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
  });

  React.useEffect(() => {
    if (!open) return;
    reset(
      student
        ? {
            name: student.name,
            phone: student.phone,
            email: student.email,
            parent_contact: student.parent_contact,
            subject: student.subject,
            level: student.level,
            lesson_price: student.lesson_price,
            currency: student.currency,
            lesson_format: student.lesson_format,
            status: student.status,
            notes: student.notes,
          }
        : {
            name: "",
            phone: "",
            email: "",
            parent_contact: "",
            subject: "",
            level: "",
            lesson_price: profile?.default_lesson_price ?? 1000,
            currency: profile?.default_currency ?? "RUB",
            lesson_format: "online",
            status: "active",
            notes: "",
          }
    );
  }, [open, student, reset, profile]);

  const onSubmit = async (values: StudentFormValues) => {
    try {
      if (isEdit && student) {
        await updateStudent(student.id, values);
        toast("Ученик обновлён");
      } else {
        await addStudent({ ...values, user_id: "" } as Omit<Student, "id" | "created_at" | "updated_at">);
        toast("Ученик добавлен");
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
          <DialogTitle>{isEdit ? "Редактировать ученика" : "Новый ученик"}</DialogTitle>
          <DialogDescription>
            Заполните данные ученика. Поля со звёздочкой обязательны.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody className="space-y-4">
            <Field label="Имя" htmlFor="name" required error={errors.name?.message}>
              <Input id="name" placeholder="Анна Смирнова" {...register("name")} />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Телефон" htmlFor="phone" error={errors.phone?.message}>
                <Input id="phone" placeholder="+7 900 000-00-00" {...register("phone")} />
              </Field>
              <Field label="Email" htmlFor="email" error={errors.email?.message}>
                <Input id="email" type="email" placeholder="anna@example.com" {...register("email")} />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Предмет" htmlFor="subject" error={errors.subject?.message}>
                <Input id="subject" placeholder="Английский" {...register("subject")} />
              </Field>
              <Field label="Уровень" htmlFor="level" error={errors.level?.message}>
                <Input id="level" placeholder="B1 / 9 класс" {...register("level")} />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Цена занятия" htmlFor="lesson_price" required error={errors.lesson_price?.message}>
                <Input id="lesson_price" type="number" step="any" min={0} {...register("lesson_price")} />
              </Field>
              <Field label="Валюта" error={errors.currency?.message}>
                <Controller
                  control={control}
                  name="currency"
                  render={({ field }) => (
                    <MenuSelect value={field.value} onChange={field.onChange} options={CURRENCY_OPTIONS} />
                  )}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Формат занятий" error={errors.lesson_format?.message}>
                <Controller
                  control={control}
                  name="lesson_format"
                  render={({ field }) => (
                    <MenuSelect value={field.value} onChange={field.onChange} options={LESSON_FORMAT_OPTIONS} />
                  )}
                />
              </Field>
              <Field label="Статус" error={errors.status?.message}>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <MenuSelect value={field.value} onChange={field.onChange} options={STUDENT_STATUS_OPTIONS} />
                  )}
                />
              </Field>
            </div>

            <Field label="Контакт родителя" htmlFor="parent_contact" error={errors.parent_contact?.message}>
              <Input
                id="parent_contact"
                placeholder="Имя и телефон родителя"
                {...register("parent_contact")}
              />
            </Field>

            <Field label="Заметки" htmlFor="notes" error={errors.notes?.message}>
              <Textarea id="notes" rows={3} placeholder="Цели, особенности, пожелания..." {...register("notes")} />
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
