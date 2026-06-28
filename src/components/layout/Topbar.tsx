"use client";

import { MobileBrand } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";
import { GlobalSearch } from "./GlobalSearch";

export function Topbar() {
  return (
    <header className="topbar">
      <div className="mobile-only">
        <MobileBrand />
      </div>

      <div className="lg-only grow">
        <GlobalSearch />
      </div>

      <div className="ml-auto mobile-only">
        <ThemeToggle />
      </div>
    </header>
  );
}
