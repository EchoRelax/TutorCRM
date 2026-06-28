import { addDays, format } from "date-fns";

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function toISODate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "yyyy-MM-dd");
}

export function addDaysISO(dateISO: string, days: number): string {
  const base = new Date(dateISO + "T00:00:00");
  return format(addDays(base, days), "yyyy-MM-dd");
}

export function isoNow(): string {
  return new Date().toISOString();
}
