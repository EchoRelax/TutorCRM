"use client";

import * as React from "react";
import { Wallet, Plus } from "lucide-react";
import { isWithinInterval, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { useData } from "@/context/DataProvider";
import { useQuickAdd } from "@/context/QuickAddProvider";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { MenuSelect } from "@/components/ui/menu-select";
import { PaymentsTable } from "@/components/tables/PaymentsTable";
import { EmptyState } from "@/components/EmptyState";

export default function PaymentsPage() {
  const { payments, students, profile, loading } = useData();
  const { openPayment } = useQuickAdd();

  const [studentId, setStudentId] = React.useState<string>("all");
  const [period, setPeriod] = React.useState<"all" | "month">("all");

  const currency = profile?.default_currency ?? "RUB";

  const filtered = React.useMemo(() => {
    const n = new Date();
    return payments.filter((p) => {
      if (studentId !== "all" && p.student_id !== studentId) return false;
      if (period === "month") {
        const d = parseISO(p.payment_date);
        if (!isWithinInterval(d, { start: startOfMonth(n), end: endOfMonth(n) })) return false;
      }
      return true;
    });
  }, [payments, studentId, period]);

  const total = filtered.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader
        title="Оплаты"
        description={`Всего платежей: ${payments.length}`}
        actions={
          <Button onClick={() => openPayment()}>
            <Plus className="h-4 w-4" />
            Добавить оплату
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <MenuSelect
          value={studentId}
          onChange={setStudentId}
          options={[
            { value: "all", label: "Все ученики" },
            ...students.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />
        <MenuSelect
          value={period}
          onChange={(v) => setPeriod(v as "all" | "month")}
          options={[
            { value: "all", label: "За всё время" },
            { value: "month", label: "Этот месяц" },
          ]}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Общая сумма: <span className="font-semibold text-foreground">{formatCurrency(total, currency)}</span>
      </p>

      {loading ? null : filtered.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title={payments.length === 0 ? "Оплат пока нет" : "Оплат не найдено"}
          description={
            payments.length === 0
              ? "Когда ученик оплатит занятие, добавьте платёж здесь."
              : "Попробуйте изменить фильтры."
          }
          action={
            payments.length === 0 ? (
              <Button onClick={() => openPayment()}>
                <Plus className="h-4 w-4" />
                Добавить оплату
              </Button>
            ) : undefined
          }
        />
      ) : (
        <PaymentsTable payments={filtered} />
      )}
    </div>
  );
}
