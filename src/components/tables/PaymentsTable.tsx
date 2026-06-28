"use client";

import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useData } from "@/context/DataProvider";
import { useQuickAdd } from "@/context/QuickAddProvider";
import type { Payment } from "@/lib/types";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";

interface Props {
  payments: Payment[];
  showStudent?: boolean;
}

export function PaymentsTable({ payments, showStudent = true }: Props) {
  const { students, removePayment } = useData();
  const { openPayment } = useQuickAdd();
  const [toDelete, setToDelete] = React.useState<Payment | null>(null);

  const studentName = (id: string) => students.find((s) => s.id === id)?.name ?? "—";
  const studentCurrency = (id: string) => students.find((s) => s.id === id)?.currency ?? "RUB";

  const handleDelete = async () => {
    if (!toDelete) return;
    await removePayment(toDelete.id);
    setToDelete(null);
  };

  if (payments.length === 0) return null;

  return (
    <>
      <div className="card card--flat overflow-hidden hidden md:block">
        <table className="tbl">
          <thead>
            <tr>
              <th>Дата</th>
              {showStudent && <th>Ученик</th>}
              <th>Сумма</th>
              <th>Способ</th>
              <th>Комментарий</th>
              <th className="text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="nowrap font-medium">{formatDate(p.payment_date)}</td>
                {showStudent && <td>{studentName(p.student_id)}</td>}
                <td className="font-semibold text-success">
                  +{formatCurrency(p.amount, p.currency || studentCurrency(p.student_id))}
                </td>
                <td>
                  <Badge variant="secondary">{PAYMENT_METHOD_LABELS[p.payment_method]}</Badge>
                </td>
                <td className="text-muted-foreground"><div className="truncate" style={{ maxWidth: 220 }}>{p.comment || "—"}</div></td>
                <td>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openPayment({ payment: p })} aria-label="Редактировать">
                      <Pencil />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setToDelete(p)} className="text-destructive" aria-label="Удалить">
                      <Trash2 />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="stack-2 md:hidden">
        {payments.map((p) => (
          <div key={p.id} className="card card--flat p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium">{formatDate(p.payment_date)}</p>
                {showStudent && <p className="text-sm text-muted-foreground">{studentName(p.student_id)}</p>}
              </div>
              <p className="shrink-0 font-semibold text-success">
                +{formatCurrency(p.amount, p.currency || studentCurrency(p.student_id))}
              </p>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <Badge variant="secondary">{PAYMENT_METHOD_LABELS[p.payment_method]}</Badge>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => openPayment({ payment: p })}>
                  <Pencil />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => setToDelete(p)} className="text-destructive">
                  <Trash2 />
                </Button>
              </div>
            </div>
            {p.comment && <p className="mt-2 text-xs text-muted-foreground">{p.comment}</p>}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Удалить оплату?"
        description="После удаления оплата не будет учитываться. Долг ученика пересчитается."
        confirmText="Удалить"
        destructive
        onConfirm={handleDelete}
      />
    </>
  );
}
