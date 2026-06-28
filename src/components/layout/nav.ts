"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Wallet,
  ClipboardList,
  BarChart3,
  CalendarRange,
  Settings,
  Crown,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  short?: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Главная", icon: LayoutDashboard },
  { href: "/students", label: "Ученики", icon: Users },
  { href: "/lessons", label: "Занятия", icon: CalendarDays },
  { href: "/calendar", label: "Календарь", short: "Календарь", icon: CalendarRange },
  { href: "/payments", label: "Оплаты", icon: Wallet },
  { href: "/homework", label: "Домашние задания", short: "Задания", icon: ClipboardList },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
];

export const SETTINGS_NAV: NavItem = { href: "/settings", label: "Настройки", icon: Settings };

export const SUBSCRIPTION_NAV: NavItem = { href: "/subscription", label: "Подписка", icon: Crown };

export const MOBILE_PRIMARY = ["/dashboard", "/students", "/calendar", "/payments"];
