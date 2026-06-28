import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Crown } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { NAV_ITEMS, SETTINGS_NAV, WHATS_NEW_NAV } from "./nav";
import { useAuth } from "@/context/AuthProvider";
import { useSubscription } from "@/context/SubscriptionProvider";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isPro, isLifetime } = useSubscription();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Logo className="h-7 w-7" />
        <span>Lumen</span>
        <span className="beta-badge">Beta</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("nav-link", active && "is-active")}
            >
              <Icon />
              {item.label}
            </Link>
          );
        })}

        <hr className="nav-sep" />

        <Link
          href={SETTINGS_NAV.href}
          className={cn(
            "nav-link",
            pathname.startsWith(SETTINGS_NAV.href) && "is-active"
          )}
        >
          <SETTINGS_NAV.icon />
          {SETTINGS_NAV.label}
        </Link>

        <Link
          href={WHATS_NEW_NAV.href}
          className={cn(
            "nav-link",
            pathname.startsWith(WHATS_NEW_NAV.href) && "is-active"
          )}
        >
          <WHATS_NEW_NAV.icon />
          {WHATS_NEW_NAV.label}
        </Link>
      </nav>

      <div className="sidebar-foot">
        <Link
          href="/subscription"
          className={cn(
            "nav-link",
            pathname.startsWith("/subscription") && "is-active"
          )}
        >
          <Crown />
          <span className="grow">Улучшить профиль</span>
          {isPro && (
            <span className={cn("nav-pro-badge", isLifetime && "life")}>
              {isLifetime ? "Life" : "Pro"}
            </span>
          )}
        </Link>

        <div className="profile-block">
          <Link
            href="/settings"
            className="flex min-w-0 grow items-center gap-2"
            title="Профиль и настройки"
          >
            <div className="avatar avatar--initials">
              {initials(user?.full_name ?? user?.email ?? "ТР")}
            </div>
            <div className="profile-meta">
              <p className="profile-name truncate">{user?.full_name || "Репетитор"}</p>
              <p className="profile-sub truncate">Профиль</p>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon-sm" onClick={logout} aria-label="Выйти" title="Выйти">
              <LogOut />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
