"use client";

import * as React from "react";
import { createPortal } from "react-dom";
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

function buildSlots(step: number) {
  const arr: string[] = [];
  for (let m = 0; m < 24 * 60; m += step) {
    arr.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  }
  return arr;
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Выберите время",
  className,
  disabled,
  step = 30,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [coords, setCoords] = React.useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const popRef = React.useRef<HTMLDivElement>(null);
  const slots = React.useMemo(() => (step === 30 ? SLOTS_30 : buildSlots(step)), [step]);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const maxH = Math.min(240, window.innerHeight - r.bottom - 16);
      setCoords({ top: r.bottom + 6, left: r.left, width: r.width, maxHeight: maxH });
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

  return (
    <div className={cn("relative", className)}>
      <button
        ref={btnRef}
        type="button"
        className={cn("menuselect-btn picker-trigger", open && "is-open")}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={cn("truncate", !value && "menuselect-placeholder")}>{value || placeholder}</span>
        <Clock />
      </button>
      {mounted && open && coords
        ? createPortal(
            <div
              ref={popRef}
              className="menu time-picker-list animate-scale-in"
              style={{ position: "fixed", top: `${coords.top}px`, left: `${coords.left}px`, width: `${coords.width}px`, maxHeight: `${coords.maxHeight}px`, zIndex: 70 }}
            >
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
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

const SLOTS_30 = buildSlots(30);
