"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, User, CalendarDays, CornerDownLeft } from "lucide-react";
import { useData } from "@/context/DataProvider";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface Result {
  id: string;
  label: string;
  sub: string;
  href: string;
  icon: "user" | "lesson";
}

export function GlobalSearch() {
  const { students, lessons } = useData();
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const results = React.useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const studentHits: Result[] = students
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.subject?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        label: s.name,
        sub: [s.subject, s.level].filter(Boolean).join(" · ") || "Ученик",
        href: `/students/${s.id}`,
        icon: "user",
      }));
    const lessonHits: Result[] = lessons
      .filter((l) => l.topic?.toLowerCase().includes(q) || l.subject?.toLowerCase().includes(q))
      .slice(0, 4)
      .map((l) => ({
        id: l.id,
        label: l.topic || l.subject || "Занятие",
        sub: students.find((s) => s.id === l.student_id)?.name ?? "",
        href: `/students/${l.student_id}`,
        icon: "lesson",
      }));
    return [...studentHits, ...lessonHits];
  }, [query, students, lessons]);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (r: Result) => {
    router.push(r.href);
    setQuery("");
    setOpen(false);
    setActive(0);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md field-affix">
      <Search className="affix-icon" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Поиск учеников и занятий…"
        className="input--icon"
      />
      {open && query.trim() && (
        <div className="search-results animate-scale-in">
          {results.length === 0 ? (
            <p className="search-empty">Ничего не найдено</p>
          ) : (
            results.map((r, i) => {
              const Icon = r.icon === "user" ? User : CalendarDays;
              return (
                <button
                  key={r.id + r.icon}
                  onClick={() => go(r)}
                  onMouseEnter={() => setActive(i)}
                  className={cn("search-item", i === active && "is-active")}
                >
                  <Icon />
                  <div className="min-w-0 grow">
                    <p className="truncate font-medium">{r.label}</p>
                    {r.sub && <p className="truncate text-muted-foreground">{r.sub}</p>}
                  </div>
                  {i === active && <CornerDownLeft />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
