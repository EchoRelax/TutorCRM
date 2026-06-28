"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { animate } from "animejs";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  const backdropRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);

    // Блокируем скролл страницы: body + основной скролл-контейнер (.app-content)
    document.body.style.overflow = "hidden";
    const scroller = document.querySelector(".app-content") as HTMLElement | null;
    const prevOverflow = scroller ? scroller.style.overflow : "";
    if (scroller) scroller.style.overflow = "hidden";

    if (backdropRef.current) {
      animate(backdropRef.current, {
        opacity: [0, 1],
        duration: 220,
        ease: "out(3)",
      });
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      if (scroller) scroller.style.overflow = prevOverflow;
    };
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <DialogPortal>
      <div className="overlay">
        <div
          ref={backdropRef}
          className="dialog-backdrop"
          onClick={() => onOpenChange(false)}
        />
        {children}
      </div>
    </DialogPortal>
  );
}

function DialogPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

function DialogContent({
  className,
  children,
  onOpenChange,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { onOpenChange?: (open: boolean) => void }) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    animate(ref.current, {
      opacity: [0, 1],
      translateY: [18, 0],
      scale: [0.98, 1],
      duration: 300,
      ease: "out(3)",
    });
  }, []);

  return (
    <div ref={ref} className={cn("dialog", className)} style={{ opacity: 0 }} {...props}>
      {children}
      {onOpenChange && (
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="dialog-close icon-btn"
          aria-label="Закрыть"
        >
          <X />
        </button>
      )}
    </div>
  );
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("dialog-header", className)} {...props} />;
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("dialog-title", className)} {...props} />;
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("dialog-description", className)} {...props} />;
}

function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("dialog-body", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("dialog-footer", className)} {...props} />;
}

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
};
