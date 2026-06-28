"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useData } from "@/context/DataProvider";
import { useToast } from "@/context/ToastProvider";
import { eventSchema, type EventFormValues } from "@/lib/validation";
import { EVENT_COLOR_OPTIONS } from "@/lib/constants";
import { todayISO } from "@/lib/utils/dates";
import type { TutorEvent } from "@/lib/types";
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
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Field } from "@/components/ui/field";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: TutorEvent | null;
  defaultDate?: string;
}

export function EventFormDialog({ open, onOpenChange, event, defaultDate }: Props) {
  const { addEvent, updateEvent } = useData();
  const { toast } = useToast();
  const isEdit = Boolean(event);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
  });

  React.useEffect(() => {
    if (!open) return;
    reset(
      event
        ? {
            title: event.title,
            date: event.date,
            start_time: event.start_time,
            end_time: event.end_time,
            color: event.color,
            notes: event.notes,
          }
        : {
            title: "",
            date: defaultDate ?? todayISO(),
            start_time: "12:00",
            end_time: "",
            color: "blue",
            notes: "",
          }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, event, defaultDate]);

  const onSubmit = async (values: EventFormValues) => {
    try {
      if (isEdit && event) {
        await updateEvent(event.id, values);
        toast("Событие обновлено");
      } else {
        await addEvent({ ...values, user_id: "" } as Omit<TutorEvent, "id" | "created_at" | "updated_at">);
        toast("Событие добавлено");
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
          <DialogTitle>{isEdit ? "Редактировать событие" : "Новое событие"}</DialogTitle>
          <DialogDescription>Личные события и планы, не связанные с учениками.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody className="space-y-4">
            <Field label="Название" required error={errors.title?.message}>
              <Input placeholder="Например, Отойти по делам" {...register("title")} />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Дата" required error={errors.date?.message}>
                <Controller
                  control={control}
                  name="date"
                  render={({ field }) => <DatePicker value={field.value ?? ""} onChange={field.onChange} />}
                />
              </Field>
              <Field label="С" required error={errors.start_time?.message}>
                <Controller
                  control={control}
                  name="start_time"
                  render={({ field }) => <TimePicker value={field.value ?? ""} onChange={field.onChange} />}
                />
              </Field>
              <Field label="До" error={errors.end_time?.message}>
                <Controller
                  control={control}
                  name="end_time"
                  render={({ field }) => <TimePicker value={field.value ?? ""} onChange={field.onChange} />}
                />
              </Field>
            </div>

            <Field label="Цвет" error={errors.color?.message}>
              <Controller
                control={control}
                name="color"
                render={({ field }) => (
                  <MenuSelect value={field.value} onChange={field.onChange} options={EVENT_COLOR_OPTIONS} />
                )}
              />
            </Field>

            <Field label="Заметки" error={errors.notes?.message}>
              <Textarea rows={2} placeholder="Подробности…" {...register("notes")} />
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
