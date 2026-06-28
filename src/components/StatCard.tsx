"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "destructive";
}

const TONES = {
  primary: "",
  success: "tone-green",
  warning: "tone-warn",
  destructive: "tone-red",
};

export function StatCard({ label, value, hint, icon: Icon, tone = "primary" }: StatCardProps) {
  return (
    <Card className="card--hover card-pad animate-fade-in-up">
      <div className="stat">
        <div className="min-w-0">
          <p className="stat-label">{label}</p>
          <p className="stat-value">{value}</p>
          {hint && <p className="stat-hint">{hint}</p>}
        </div>
        <div className={cn("stat-icon", TONES[tone])}>
          <Icon />
        </div>
      </div>
    </Card>
  );
}
