"use client";

import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Currency } from "@/lib/types";

interface DebtBadgeProps {
  debt: number;
  currency?: Currency;
  showZeroLabel?: boolean;
}

export function DebtBadge({ debt, currency = "RUB", showZeroLabel = false }: DebtBadgeProps) {
  if (debt > 0) {
    return <Badge variant="destructive">Долг {formatCurrency(debt, currency)}</Badge>;
  }
  return showZeroLabel ? (
    <Badge variant="success">Долга нет</Badge>
  ) : (
    <Badge variant="muted">{formatCurrency(0, currency)}</Badge>
  );
}
