"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MenuOption {
  value: string;
  label: string;
}

interface MenuSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: MenuOption[];
  placeholder?: string;
  className?: string;
  id?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

export function MenuSelect({
  value,
  onChange,
  options,
  placeholder = "Выберите…",
  className,
  id,
  ariaLabel,
  disabled,
}: MenuSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const ref = React.useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  React.useEffect(() => {
    if (open) setActive(options.findIndex((o) => o.value === value));
  }, [open, options, value]);

  const choose = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + options.length) % options.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0) choose(options[active].value);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={cn("menuselect-btn", open && "is-open")}
      >
        <span className={cn("truncate", !selected && "menuselect-placeholder")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown />
      </button>

      {open && (
        <div role="listbox" className="menu menu--block menu--scroll animate-scale-in">
          {options.map((o, i) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={o.value === value}
              onClick={() => choose(o.value)}
              onMouseEnter={() => setActive(i)}
              className={cn(
                "menu-item menu-item--between",
                o.value === value && "is-active"
              )}
            >
              <span className="truncate">{o.label}</span>
              {o.value === value && <Check />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
