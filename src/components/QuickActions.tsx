"use client";

import { UserPlus, CalendarPlus, Wallet, ClipboardList } from "lucide-react";
import { useQuickAdd } from "@/context/QuickAddProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  className?: string;
  defaultStudentId?: string;
  compact?: boolean;
}

export function QuickActions({ className, defaultStudentId, compact }: QuickActionsProps) {
  const { openStudent, openLesson, openPayment, openHomework } = useQuickAdd();

  const actions = [
    { label: "Добавить ученика", icon: UserPlus, onClick: () => openStudent() },
    {
      label: "Добавить занятие",
      icon: CalendarPlus,
      onClick: () => openLesson({ defaultStudentId }),
    },
    {
      label: "Добавить оплату",
      icon: Wallet,
      onClick: () => openPayment({ defaultStudentId }),
    },
    {
      label: "Добавить задание",
      icon: ClipboardList,
      onClick: () => openHomework({ defaultStudentId }),
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:flex sm:flex-wrap", className)}>
      {actions.map((a) => (
        <Button
          key={a.label}
          variant={compact ? "outline" : "secondary"}
          onClick={a.onClick}
          className="justify-start"
        >
          <a.icon className="h-4 w-4" />
          {a.label}
        </Button>
      ))}
    </div>
  );
}
