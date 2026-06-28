"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import { ru } from "date-fns/locale";
import { format, parseISO, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import "react-day-picker/style.css";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Выберите дату",
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const popRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const left = Math.min(r.left, window.innerWidth - 300);
      setCoords({ top: r.bottom + 6, left: Math.max(8, left) });
    }
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || popRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const parsed = value ? parseISO(value) : undefined;
  const selected = parsed && isValid(parsed) ? parsed : undefined;

  return (
    <div className={cn("relative", className)}>
      <button
        ref={btnRef}
        type="button"
        className={cn("menuselect-btn picker-trigger", open && "is-open")}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={cn("truncate", !selected && "menuselect-placeholder")}>
          {selected ? format(selected, "d MMM yyyy", { locale: ru }) : placeholder}
        </span>
        <CalendarIcon />
      </button>
      {mounted && open && coords
        ? createPortal(
            <div
              ref={popRef}
              className="rdp-popover animate-scale-in"
              style={{ position: "fixed", top: `${coords.top}px`, left: `${coords.left}px`, zIndex: 70 }}
            >
              <DayPicker
                mode="single"
                locale={ru}
                weekStartsOn={1}
                selected={selected}
                onSelect={(d) => {
                  if (!d) return;
                  onChange(format(d, "yyyy-MM-dd"));
                  setOpen(false);
                }}
              />
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
