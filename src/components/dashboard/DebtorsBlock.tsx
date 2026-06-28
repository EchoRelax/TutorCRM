"use client";

import * as React from "react";
import Link from "next/link";
import { Copy, AlertTriangle, Inbox } from "lucide-react";
import { useData } from "@/context/DataProvider";
import { useToast } from "@/context/ToastProvider";
import { getDebtors } from "@/lib/calc";
import { REMINDER_TEMPLATE } from "@/lib/constants";
import { copyToClipboard, formatCurrency, initials, pluralize } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DebtorsBlock() {
  const { students, lessons, payments } = useData();
  const { toast } = useToast();

  const debtors = getDebtors(students, lessons, payments);

  const handleCopy = async (name: string, amount: number, currency: Parameters<typeof formatCurrency>[1]) => {
    const text = REMINDER_TEMPLATE(formatCurrency(amount, currency), name.split(" ")[0]);
    const ok = await copyToClipboard(text);
    toast(ok ? "Напоминание скопировано" : "Не удалось скопировать", ok ? "success" : "error");
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Должники
        </CardTitle>
        <CardDescription>Ученики с неоплаченными занятиями</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        {debtors.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Inbox className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Долгов нет. Все оплачено.</p>
          </div>
        ) : (
          debtors.map(({ student, debt, unpaidCount }) => (
            <div
              key={student.id}
              className="card card--flat card--hover p-3"
            >
              <div className="flex items-center gap-2.5">
                <div className="avatar avatar--sm avatar--danger">{initials(student.name)}</div>
                <div className="min-w-0 flex-1">
                  <Link href={`/students/${student.id}`} className="block truncate text-sm font-medium hover:underline">
                    {student.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {unpaidCount} {pluralize(unpaidCount, ["занятие", "занятия", "занятий"])}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-destructive">
                  {formatCurrency(debt, student.currency)}
                </span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleCopy(student.name, debt, student.currency)}
                className="mt-2.5 w-full"
              >
                <Copy className="h-3.5 w-3.5" />
                Скопировать напоминание
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
