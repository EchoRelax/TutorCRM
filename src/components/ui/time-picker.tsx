"use client";

import * as React from "react";
import { Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  step?: number;
}

const SLOTS_30 = (() => {
  const arr: string[] = [];
  for (let m = 0; m < 24 * 60; m += 30) {
    arr.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  }
  return arr;
})();

export function TimePicker({
  value,
  onChange,
  placeholder = "Выберите время",
  className,
  disabled,
  step = 30,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const slots = step === 30 ? SLOTS_30 : (() => {
    const arr: string[] = [];
    for (let m = 0; m < 24 * 60; m += step) {
      arr.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
    }
    return arr;
  })();

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
        <span className={cn("truncate", !value && "menuselect-placeholder")}>
          {value || placeholder}
        </span>
        <Clock />
      </button>
      {open && (
        <div className="menu menu--block time-picker-list animate-scale-in">
          {slots.map((s) => (
            <button
              key={s}
              type="button"
              className={cn("menu-item menu-item--between", s === value && "is-active")}
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
            >
              <span>{s}</span>
              {s === value && <Check />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
