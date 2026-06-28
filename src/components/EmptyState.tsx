"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("card card--flat card-pad text-center", className)}>
      <div className="flex flex-col items-center gap-3">
        <Icon className="h-8 w-8 text-muted-foreground" />
        <div>
          <h3 className="font-display font-semibold text-base">{title}</h3>
          {description && (
            <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}
