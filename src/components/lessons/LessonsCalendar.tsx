"use client";

import * as React from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarPlus, Star } from "lucide-react";
import { useData } from "@/context/DataProvider";
import { useQuickAdd } from "@/context/QuickAddProvider";
import { EVENT_COLOR_CHIP, LESSON_STATUS_LABELS } from "@/lib/constants";
import type { Currency, Lesson, LessonStatus, TutorEvent } from "@/lib/types";
import { cn, formatCurrency, formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TimeBlock } from "@/components/ui/time-block";
import { StatusBadge } from "@/components/StatusBadge";

interface Props {
  lessons: Lesson[];
  events?: TutorEvent[];
  showAddEvent?: boolean;
}

type View = "month" | "week" | "day";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const DOT_COLOR: Record<LessonStatus, string> = {
  scheduled: "bg-primary",
  completed: "bg-success",
  cancelled: "bg-destructive",
  rescheduled: "bg-warning",
};

const CHIP_COLOR: Record<LessonStatus, string> = {
  scheduled: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive line-through",
  rescheduled: "bg-warning/15 text-warning",
};

function iso(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function groupByDay<T extends { date: string }>(items: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const it of items) {
    const arr = map.get(it.date) ?? [];
    arr.push(it);
    map.set(it.date, arr);
  }
  for (const arr of map.values()) arr.sort((a, b) => (a.date < b.date ? -1 : 1));
  return map;
}

export function LessonsCalendar({ lessons, events = [], showAddEvent }: Props) {
  const { students } = useData();
  const { openLesson, openEvent } = useQuickAdd();
  const [view, setView] = React.useState<View>("month");
  const [cursor, setCursor] = React.useState<Date>(new Date());

  const studentName = (id: string) => students.find((s) => s.id === id)?.name ?? "Ученик";
  const studentCurrency = (id: string): Currency => students.find((s) => s.id === id)?.currency ?? "RUB";

  const lessonsByDay = React.useMemo(() => groupByDay(lessons), [lessons]);
  const eventsByDay = React.useMemo(() => groupByDay(events), [events]);

  const today = new Date();
  const title =
    view === "month"
      ? format(cursor, "LLLL yyyy", { locale: ru })
      : view === "week"
        ? `${format(startOfWeek(cursor, { weekStartsOn: 1 }), "d MMM", { locale: ru })} – ${format(endOfWeek(cursor, { weekStartsOn: 1 }), "d MMM yyyy", { locale: ru })}`
        : format(cursor, "d MMMM yyyy, EEEE", { locale: ru });

  const step = (dir: number) => {
    if (view === "month") setCursor((c) => addMonths(c, dir));
    else if (view === "week") setCursor((c) => addDays(c, dir * 7));
    else setCursor((c) => addDays(c, dir));
  };

  const goToDay = (d: Date) => {
    setCursor(startOfDay(d));
    setView("day");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm animate-fade-in-up sm:p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold capitalize">{title}</h3>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-secondary/60 p-0.5">
            {(["month", "week", "day"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {v === "month" ? "Месяц" : v === "week" ? "Неделя" : "День"}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
            Сегодня
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => step(-1)} aria-label="Назад">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => step(1)} aria-label="Вперёд">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {showAddEvent && (
            <Button variant="secondary" size="sm" onClick={() => openEvent({ defaultDate: iso(cursor) })}>
              <CalendarPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Событие</span>
            </Button>
          )}
        </div>
      </div>

      {view === "month" && (
        <MonthView
          cursor={cursor}
          lessonsByDay={lessonsByDay}
          eventsByDay={eventsByDay}
          today={today}
          studentName={studentName}
          onDayClick={goToDay}
          onLessonClick={(l) => openLesson({ lesson: l })}
          onEventClick={(e) => openEvent({ event: e })}
        />
      )}
      {view === "week" && (
        <WeekView
          cursor={cursor}
          lessonsByDay={lessonsByDay}
          eventsByDay={eventsByDay}
          today={today}
          studentName={studentName}
          onDayClick={goToDay}
          onLessonClick={(l) => openLesson({ lesson: l })}
          onEventClick={(e) => openEvent({ event: e })}
        />
      )}
      {view === "day" && (
        <DayView
          cursor={cursor}
          lessonsByDay={lessonsByDay}
          eventsByDay={eventsByDay}
          studentName={studentName}
          studentCurrency={studentCurrency}
          onLessonClick={(l) => openLesson({ lesson: l })}
          onEventClick={(e) => openEvent({ event: e })}
        />
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3">
        {(Object.keys(LESSON_STATUS_LABELS) as LessonStatus[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("h-2.5 w-2.5 rounded-full", DOT_COLOR[s])} />
            {LESSON_STATUS_LABELS[s]}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Star className="h-3 w-3" />
          События
        </div>
      </div>
    </div>
  );
}

function MonthView({
  cursor,
  lessonsByDay,
  eventsByDay,
  today,
  studentName,
  onDayClick,
  onLessonClick,
  onEventClick,
}: {
  cursor: Date;
  lessonsByDay: Map<string, Lesson[]>;
  eventsByDay: Map<string, TutorEvent[]>;
  today: Date;
  studentName: (id: string) => string;
  onDayClick: (d: Date) => void;
  onLessonClick: (l: Lesson) => void;
  onEventClick: (e: TutorEvent) => void;
}) {
  const days = React.useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [cursor]);

  return (
    <div className="grid grid-cols-7 gap-1">
      {WEEKDAYS.map((d) => (
        <div key={d} className="pb-1 text-center text-[11px] font-medium uppercase text-muted-foreground">
          {d}
        </div>
      ))}
      {days.map((day) => {
        const llist = lessonsByDay.get(iso(day)) ?? [];
        const elist = eventsByDay.get(iso(day)) ?? [];
        const items = llist.length + elist.length;
        const inMonth = isSameMonth(day, cursor);
        const isToday = isSameDay(day, today);
        return (
          <div
            key={iso(day)}
            className={cn(
              "min-h-[72px] rounded-lg border p-1 transition-colors sm:min-h-[96px]",
              inMonth ? "border-transparent bg-secondary/50 hover:bg-secondary" : "border-transparent bg-transparent",
              isToday && "border-primary/40 ring-1 ring-primary/20"
            )}
          >
            <button
              onClick={() => onDayClick(day)}
              className="block w-full cursor-pointer text-right text-xs font-medium hover:text-primary"
              title="Открыть день"
            >
              <span
                className={cn(
                  "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1",
                  isToday && "bg-primary text-primary-foreground",
                  !isToday && !inMonth && "text-muted-foreground/40",
                  !isToday && inMonth && "text-foreground"
                )}
              >
                {format(day, "d")}
              </span>
            </button>
            <div className="mt-0.5 space-y-1">
              {[...llist, ...elist].slice(0, 2).map((item) => {
                const isLesson = "student_id" in item;
                return isLesson ? (
                  <button
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onLessonClick(item as Lesson);
                    }}
                    className={cn(
                      "block w-full truncate rounded px-1 py-0.5 text-left text-[11px] font-medium transition-opacity hover:opacity-80",
                      CHIP_COLOR[(item as Lesson).status]
                    )}
                    title={`${(item as Lesson).start_time} — ${studentName((item as Lesson).student_id)}`}
                  >
                    <span className="tabular-nums">{(item as Lesson).start_time}</span>{" "}
                    <span className="hidden sm:inline">{studentName((item as Lesson).student_id)}</span>
                    <span className="sm:hidden">·</span>
                  </button>
                ) : (
                  <button
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(item as TutorEvent);
                    }}
                    className={cn(
                      "flex w-full items-center gap-1 truncate rounded border px-1 py-0.5 text-left text-[11px] font-medium transition-opacity hover:opacity-80",
                      EVENT_COLOR_CHIP[(item as TutorEvent).color]
                    )}
                    title={(item as TutorEvent).title}
                  >
                    <Star className="h-2.5 w-2.5 shrink-0" />
                    <span className="truncate">{(item as TutorEvent).title}</span>
                  </button>
                );
              })}
              {items > 2 && (
                <button onClick={() => onDayClick(day)} className="px-1 text-[10px] text-muted-foreground hover:text-primary">
                  ещё {items - 2}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WeekView({
  cursor,
  lessonsByDay,
  eventsByDay,
  today,
  studentName,
  onDayClick,
  onLessonClick,
  onEventClick,
}: {
  cursor: Date;
  lessonsByDay: Map<string, Lesson[]>;
  eventsByDay: Map<string, TutorEvent[]>;
  today: Date;
  studentName: (id: string) => string;
  onDayClick: (d: Date) => void;
  onLessonClick: (l: Lesson) => void;
  onEventClick: (e: TutorEvent) => void;
}) {
  const days = React.useMemo(() => {
    const s = startOfWeek(cursor, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(s, i));
  }, [cursor]);

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((day) => {
        const llist = lessonsByDay.get(iso(day)) ?? [];
        const elist = eventsByDay.get(iso(day)) ?? [];
        const isToday = isSameDay(day, today);
        return (
          <div key={iso(day)} className="min-h-[180px] rounded-lg border border-border bg-secondary/30 p-1.5">
            <button
              onClick={() => onDayClick(day)}
              className="mb-1.5 flex w-full items-center justify-between rounded-md px-1 hover:text-primary"
            >
              <span className="text-[11px] uppercase text-muted-foreground">{format(day, "EE", { locale: ru })}</span>
              <span
                className={cn(
                  "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-semibold",
                  isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                )}
              >
                {format(day, "d")}
              </span>
            </button>
            <div className="space-y-1">
              {llist.map((l) => (
                <button
                  key={l.id}
                  onClick={() => onLessonClick(l)}
                  className={cn(
                    "block w-full rounded-md px-1.5 py-1 text-left text-[11px] font-medium transition-opacity hover:opacity-80",
                    CHIP_COLOR[l.status]
                  )}
                >
                  <div className="tabular-nums">{l.start_time}</div>
                  <div className="truncate">{studentName(l.student_id)}</div>
                </button>
              ))}
              {elist.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => onEventClick(ev)}
                  className={cn(
                    "flex w-full items-center gap-1 rounded-md border px-1.5 py-1 text-left text-[11px] font-medium transition-opacity hover:opacity-80",
                    EVENT_COLOR_CHIP[ev.color]
                  )}
                >
                  <Star className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{ev.title}</span>
                </button>
              ))}
              {llist.length === 0 && elist.length === 0 && (
                <p className="px-1 text-[10px] text-muted-foreground/60">—</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayView({
  cursor,
  lessonsByDay,
  eventsByDay,
  studentName,
  studentCurrency,
  onLessonClick,
  onEventClick,
}: {
  cursor: Date;
  lessonsByDay: Map<string, Lesson[]>;
  eventsByDay: Map<string, TutorEvent[]>;
  studentName: (id: string) => string;
  studentCurrency: (id: string) => Currency;
  onLessonClick: (l: Lesson) => void;
  onEventClick: (e: TutorEvent) => void;
}) {
  const llist = lessonsByDay.get(iso(cursor)) ?? [];
  const elist = eventsByDay.get(iso(cursor)) ?? [];
  const all = [
    ...llist.map((l) => ({ kind: "lesson" as const, time: l.start_time, node: l })),
    ...elist.map((e) => ({ kind: "event" as const, time: e.start_time, node: e })),
  ].sort((a, b) => (a.time < b.time ? -1 : 1));

  return (
    <div className="space-y-2">
      {all.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">На этот день ничего нет.</p>
      ) : (
        all.map(({ kind, node }) =>
          kind === "lesson" ? (
            <button
              key={node.id}
              onClick={() => onLessonClick(node)}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-all hover:shadow-md"
            >
              <TimeBlock time={formatTime(node.start_time)} duration={node.duration_minutes} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{studentName(node.student_id)}</p>
                <p className="truncate text-sm text-muted-foreground">{node.topic || node.subject || "Занятие"}</p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">{formatCurrency(node.price, studentCurrency(node.student_id))}</p>
              </div>
              <StatusBadge kind="lesson" status={node.status} />
            </button>
          ) : (
            <button
              key={node.id}
              onClick={() => onEventClick(node)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left transition-all hover:shadow-md",
                EVENT_COLOR_CHIP[node.color]
              )}
            >
              <TimeBlock time={formatTime(node.start_time)} end={node.end_time || undefined} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate font-medium">
                  <Star className="h-3.5 w-3.5" />
                  {node.title}
                </p>
                {node.notes && <p className="truncate text-sm opacity-80">{node.notes}</p>}
              </div>
              <span className="text-xs opacity-70">Событие</span>
            </button>
          )
        )
      )}
    </div>
  );
}
