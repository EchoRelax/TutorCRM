"use client";

import * as React from "react";
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
  const ref = React.useRef<HTMLDivElement>(null);

  const parsed = value ? parseISO(value) : undefined;
  const selected = parsed && isValid(parsed) ? parsed : undefined;

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
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
      {open && (
        <div className="rdp-popover animate-scale-in">
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
        </div>
      )}
    </div>
  );
}
