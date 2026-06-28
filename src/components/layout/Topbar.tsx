"use client";

import { MobileBrand } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";
import { GlobalSearch } from "./GlobalSearch";

export function Topbar() {
  return (
    <header className="topbar">
      <div className="mobile-only min-w-0">
        <MobileBrand />
      </div>

      <div className="lg-only grow">
        <GlobalSearch />
      </div>

      <div className="ml-auto shrink-0 mobile-only">
        <ThemeToggle />
      </div>
    </header>
  );
}
