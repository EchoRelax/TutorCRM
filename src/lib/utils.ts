import { clsx, type ClassValue } from "clsx";
import { format, isValid, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { CURRENCY_LABELS } from "./constants";
import type { Currency } from "./types";

export { todayISO, isoNow, toISODate, addDaysISO } from "./utils/dates";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number, currency: Currency = "RUB"): string {
  const symbol = CURRENCY_LABELS[currency] ?? "";
  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  const formatted = rounded.toLocaleString("ru-RU", {
    minimumFractionDigits: Number.isInteger(rounded) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${symbol}`;
}

export function formatDate(date: string | Date, pattern = "d MMM yyyy"): string {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsed)) return "—";
  return format(parsed, pattern, { locale: ru });
}

export function formatDateLong(date: string | Date): string {
  return formatDate(date, "d MMMM yyyy");
}

export function formatTime(time: string): string {
  return time ?? "—";
}

export function genId(prefix = "id"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    return navigator.clipboard
      .writeText(text)
      .then(() => true)
      .catch(() => fallbackCopy(text));
  }
  return Promise.resolve(fallbackCopy(text));
}

function fallbackCopy(text: string): boolean {
  if (typeof document === "undefined") return false;
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function pluralize(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const n1 = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (n1 > 1 && n1 < 5) return forms[1];
  if (n1 === 1) return forms[0];
  return forms[2];
}
