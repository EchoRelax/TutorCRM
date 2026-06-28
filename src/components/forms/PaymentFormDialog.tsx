"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useData } from "@/context/DataProvider";
import { useToast } from "@/context/ToastProvider";
import { paymentSchema, type PaymentFormValues } from "@/lib/validation";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/constants";
import { todayISO } from "@/lib/utils/dates";
import type { Payment } from "@/lib/types";
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
import { Field } from "@/components/ui/field";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: Payment | null;
  defaultStudentId?: string;
}

export function PaymentFormDialog({ open, onOpenChange, payment, defaultStudentId }: Props) {
  const { students, addPayment, updatePayment, profile } = useData();
  const { toast } = useToast();
  const isEdit = Boolean(payment);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
  });

  React.useEffect(() => {
    if (!open) return;
    reset(
      payment
        ? {
            student_id: payment.student_id,
            payment_date: payment.payment_date,
            amount: payment.amount,
            payment_method: payment.payment_method,
            comment: payment.comment,
          }
        : {
            student_id: defaultStudentId ?? "",
            payment_date: todayISO(),
            amount: 0,
            payment_method: "card",
            comment: "",
          }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, payment, defaultStudentId]);

  const onSubmit = async (values: PaymentFormValues) => {
    try {
      const currency =
        students.find((s) => s.id === values.student_id)?.currency ?? profile?.default_currency ?? "RUB";
      if (isEdit && payment) {
        await updatePayment(payment.id, { ...values, currency });
        toast("Оплата обновлена");
      } else {
        await addPayment({ ...values, currency, user_id: "" } as Omit<Payment, "id" | "created_at" | "updated_at">);
        toast("Оплата добавлена");
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
          <DialogTitle>{isEdit ? "Редактировать оплату" : "Новая оплата"}</DialogTitle>
          <DialogDescription>Оплата уменьшает долг ученика.</DialogDescription>
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
              <Field label="Сумма" required error={errors.amount?.message}>
                <Input type="number" min={0} step="any" placeholder="2000" {...register("amount")} />
              </Field>
              <Field label="Дата оплаты" required error={errors.payment_date?.message}>
                <Controller
                  control={control}
                  name="payment_date"
                  render={({ field }) => <DatePicker value={field.value ?? ""} onChange={field.onChange} />}
                />
              </Field>
            </div>

            <Field label="Способ оплаты" error={errors.payment_method?.message}>
              <Controller
                control={control}
                name="payment_method"
                render={({ field }) => (
                  <MenuSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={PAYMENT_METHOD_OPTIONS}
                  />
                )}
              />
            </Field>

            <Field label="Комментарий" error={errors.comment?.message}>
              <Textarea rows={2} placeholder="Например, за 2 занятия" {...register("comment")} />
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
