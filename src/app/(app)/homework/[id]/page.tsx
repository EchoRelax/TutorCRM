"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Copy,
  CalendarCheck,
  AlarmClock,
  User,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { parseISO } from "date-fns";
import { useData } from "@/context/DataProvider";
import { useQuickAdd } from "@/context/QuickAddProvider";
import { useToast } from "@/context/ToastProvider";
import { HOMEWORK_MESSAGE_TEMPLATE, HOMEWORK_STATUS_OPTIONS } from "@/lib/constants";
import { cn, copyToClipboard, formatDate } from "@/lib/utils";
import type { HomeworkStatus } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { HomeworkStatusBadge } from "@/components/StatusBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function HomeworkDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { homework, students, updateHomework, removeHomework, loading } = useData();
  const { openHomework } = useQuickAdd();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const h = homework.find((x) => x.id === params.id);
  const student = h ? students.find((s) => s.id === h.student_id) : undefined;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!h) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild className="-ml-2">
          <Link href="/homework">
            <ArrowLeft className="h-4 w-4" />
            К заданиям
          </Link>
        </Button>
        <p className="text-muted-foreground">Задание не найдено.</p>
      </div>
    );
  }

  const today = new Date(new Date().toDateString());
  const overdue = h.status !== "completed" && parseISO(h.due_date) < today;

  const handleCopy = async () => {
    const text = HOMEWORK_MESSAGE_TEMPLATE(h.description || h.title, formatDate(h.due_date, "d MMM yyyy"));
    const ok = await copyToClipboard(text);
    toast(ok ? "Сообщение скопировано" : "Не удалось скопировать", ok ? "success" : "error");
  };

  const setStatus = async (status: HomeworkStatus) => {
    await updateHomework(h.id, { status });
    toast("Статус обновлён");
  };

  const handleDelete = async () => {
    await removeHomework(h.id);
    router.push("/homework");
  };

  return (
    <div className="space-y-5">
      <Button variant="ghost" asChild className="-ml-2 mb-1">
        <Link href="/homework">
          <ArrowLeft className="h-4 w-4" />
          Домашние задания
        </Link>
      </Button>

      <PageHeader
        title={h.title}
        description={student ? `${student.name}${student.subject ? " · " + student.subject : ""}` : undefined}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => openHomework({ homework: h })}>
              <Pencil className="h-4 w-4" />
              Редактировать
            </Button>
            <Button variant="outline" onClick={() => setConfirmDelete(true)} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
              Удалить
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <HomeworkStatusBadge status={h.status} />
        {student && (
          <Link
            href={`/students/${student.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <User className="h-3.5 w-3.5" />
            {student.name}
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Описание</CardTitle>
            </CardHeader>
            <CardContent>
              {h.description ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{h.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Без описания.</p>
              )}
            </CardContent>
          </Card>

          {h.comment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  Комментарий
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{h.comment}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-4">
              <DateRow
                icon={CalendarCheck}
                label="Выдано"
                value={formatDate(h.assigned_date, "d MMM yyyy")}
              />
              <DateRow
                icon={AlarmClock}
                label="Дедлайн"
                value={`${formatDate(h.due_date, "d MMM yyyy")}${overdue ? " · просрочено" : ""}`}
                danger={overdue}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Статус</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {HOMEWORK_STATUS_OPTIONS.map((o) => (
                <Button
                  key={o.value}
                  size="sm"
                  variant={h.status === o.value ? "default" : "outline"}
                  onClick={() => setStatus(o.value as HomeworkStatus)}
                >
                  {o.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Button onClick={handleCopy} className="w-full">
            <Copy className="h-4 w-4" />
            Скопировать сообщение
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Удалить задание?"
        description="Домашнее задание будет удалено безвозвратно."
        confirmText="Удалить"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}

function DateRow({
  icon: Icon,
  label,
  value,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          danger ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-sm font-medium", danger && "text-destructive")}>{value}</p>
      </div>
    </div>
  );
}
