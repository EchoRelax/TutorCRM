"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import {
  NAV_ITEMS,
  SETTINGS_NAV,
  WHATS_NEW_NAV,
} from "./nav";

const MOBILE_ITEMS = [
  ...NAV_ITEMS,
  SETTINGS_NAV,
  WHATS_NEW_NAV,
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-inner no-scrollbar">
        {MOBILE_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={cn("mnav-item", active && "is-active")}>
              <Icon />
              <span className="mnav-label">{item.short ?? item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileBrand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      <Logo className="h-7 w-7 shrink-0" />
      <span className="font-display font-bold tracking-tight truncate">Lumen</span>
      <span className="beta-badge">Beta</span>
    </Link>
  );
}
