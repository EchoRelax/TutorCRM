"use client";

import * as React from "react";
import { CalendarPlus, Loader2 } from "lucide-react";
import { useData } from "@/context/DataProvider";
import { useQuickAdd } from "@/context/QuickAddProvider";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { LessonsCalendar } from "@/components/lessons/LessonsCalendar";

export default function CalendarPage() {
  const { lessons, events, loading } = useData();
  const { openLesson, openEvent } = useQuickAdd();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Календарь"
        description="Занятия и личные события"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => openLesson()}>
              <CalendarPlus className="h-4 w-4" />
              Занятие
            </Button>
            <Button onClick={() => openEvent()}>
              <CalendarPlus className="h-4 w-4" />
              Событие
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : (
        <LessonsCalendar lessons={lessons} events={events} showAddEvent />
      )}
    </div>
  );
}
