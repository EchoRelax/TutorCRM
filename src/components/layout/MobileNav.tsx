"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import {
  NAV_ITEMS,
  SETTINGS_NAV,
  SUBSCRIPTION_NAV,
  MOBILE_PRIMARY,
  type NavItem,
} from "./nav";

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = React.useState(false);

  const primary = NAV_ITEMS.filter((i) => MOBILE_PRIMARY.includes(i.href));
  const moreItems: NavItem[] = [
    ...NAV_ITEMS.filter((i) => !MOBILE_PRIMARY.includes(i.href)),
    SETTINGS_NAV,
    SUBSCRIPTION_NAV,
  ];
  const moreActive = moreItems.some(
    (i) => pathname === i.href || pathname.startsWith(i.href + "/")
  );

  React.useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMoreOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const scroller = document.querySelector(".app-content") as HTMLElement | null;
    const prevOverflow = scroller ? scroller.style.overflow : "";
    if (scroller) scroller.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      if (scroller) scroller.style.overflow = prevOverflow;
    };
  }, [moreOpen]);

  return (
    <>
      {moreOpen && (
        <div className="mnav-sheet-overlay" onClick={() => setMoreOpen(false)}>
          <div
            className="mnav-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Ещё"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mnav-sheet-handle" />
            <div className="mnav-sheet-head">
              <span className="mnav-sheet-title">Меню</span>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setMoreOpen(false)}
                aria-label="Закрыть"
              >
                <X />
              </button>
            </div>
            <div className="mnav-sheet-list">
              {moreItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn("mnav-sheet-item", active && "is-active")}
                  >
                    <Icon />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav className="mobile-nav">
        <div className="mobile-nav-inner no-scrollbar">
          {primary.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={cn("mnav-item", active && "is-active")}>
                <Icon />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
            className={cn("mnav-item", (moreOpen || moreActive) && "is-active")}
          >
            <MoreHorizontal />
            Ещё
          </button>
        </div>
      </nav>
    </>
  );
}

export function MobileBrand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      <Logo className="h-7 w-7" />
      <span className="font-display font-bold tracking-tight">TutorCRM</span>
      <span className="beta-badge">Beta</span>
    </Link>
  );
}
