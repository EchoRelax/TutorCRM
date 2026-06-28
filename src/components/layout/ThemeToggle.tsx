"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ size = "icon-sm" }: { size?: "icon-sm" | "icon" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? "Светлая тема" : "Тёмная тема";

  const icon = (
    <span className="theme-ico">
      <Sun className={cn("theme-sun", isDark && "is-hidden")} />
      <Moon className={cn("theme-moon", !isDark && "is-hidden")} />
    </span>
  );

  return (
    <Button variant="ghost" size={size} onClick={toggleTheme} aria-label={label} title={label}>
      {icon}
    </Button>
  );
}
