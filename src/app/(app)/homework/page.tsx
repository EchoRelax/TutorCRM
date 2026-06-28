"use client";

import * as React from "react";
import { ClipboardList, Plus } from "lucide-react";
import { useData } from "@/context/DataProvider";
import { useQuickAdd } from "@/context/QuickAddProvider";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { MenuSelect } from "@/components/ui/menu-select";
import { HomeworkList } from "@/components/tables/HomeworkList";
import { EmptyState } from "@/components/EmptyState";
import { HOMEWORK_STATUS_OPTIONS } from "@/lib/constants";
import type { HomeworkStatus } from "@/lib/types";

export default function HomeworkPage() {
  const { homework, students, loading } = useData();
  const { openHomework } = useQuickAdd();

  const [studentId, setStudentId] = React.useState<string>("all");
  const [status, setStatus] = React.useState<HomeworkStatus | "all">("all");

  const filtered = React.useMemo(() => {
    return homework
      .filter((h) => {
        if (studentId !== "all" && h.student_id !== studentId) return false;
        if (status !== "all" && h.status !== status) return false;
        return true;
      })
      .sort((a, b) => (a.due_date < b.due_date ? -1 : a.due_date > b.due_date ? 1 : 0));
  }, [homework, studentId, status]);

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader
        title="Домашние задания"
        description={`Всего заданий: ${homework.length}`}
        actions={
          <Button onClick={() => openHomework()}>
            <Plus className="h-4 w-4" />
            Добавить задание
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <MenuSelect
          value={studentId}
          onChange={setStudentId}
          options={[
            { value: "all", label: "Все ученики" },
            ...students.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />
        <MenuSelect
          value={status}
          onChange={(v) => setStatus(v as HomeworkStatus | "all")}
          options={[{ value: "all", label: "Любой статус" }, ...HOMEWORK_STATUS_OPTIONS]}
        />
      </div>

      {loading ? null : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={homework.length === 0 ? "Заданий пока нет" : "Заданий не найдено"}
          description={
            homework.length === 0
              ? "Добавьте домашнее задание и скопируйте сообщение для ученика."
              : "Попробуйте изменить фильтры."
          }
          action={
            homework.length === 0 ? (
              <Button onClick={() => openHomework()}>
                <Plus className="h-4 w-4" />
                Добавить задание
              </Button>
            ) : undefined
          }
        />
      ) : (
        <HomeworkList homework={filtered} />
      )}
    </div>
  );
}
