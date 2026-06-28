"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  CalendarPlus,
  Wallet,
  ClipboardList,
  Copy,
  Phone,
  Mail,
  UserCog,
  Trash2,
  Loader2,
  BookOpen,
  GraduationCap,
  Clock,
  NotebookPen,
} from "lucide-react";
import { useData } from "@/context/DataProvider";
import { useQuickAdd } from "@/context/QuickAddProvider";
import { useToast } from "@/context/ToastProvider";
import {
  getStudentCompletedCount,
  getStudentCompletedTotal,
  getStudentDebt,
  getStudentPaidTotal,
  getLastPayment,
} from "@/lib/calc";
import { REMINDER_TEMPLATE, LESSON_FORMAT_LABELS } from "@/lib/constants";
import {
  cn,
  copyToClipboard,
  formatCurrency,
  formatDate,
} from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StudentStatusBadge } from "@/components/StatusBadge";
import { DebtBadge } from "@/components/DebtBadge";
import { StatCard } from "@/components/StatCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LessonTimeline } from "@/components/tables/LessonTimeline";
import { PaymentsTable } from "@/components/tables/PaymentsTable";
import { HomeworkList } from "@/components/tables/HomeworkList";

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    students,
    lessons,
    payments,
    homework,
    loading,
    removeStudent,
  } = useData();
  const { openStudent, openLesson, openPayment, openHomework } = useQuickAdd();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [tab, setTab] = React.useState<"lessons" | "payments" | "homework">("lessons");

  const student = students.find((s) => s.id === params.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/students")} className="-ml-2">
          <ArrowLeft className="h-4 w-4" />
          К ученикам
        </Button>
        <p className="text-muted-foreground">Ученик не найден.</p>
      </div>
    );
  }

  const studentLessons = lessons.filter((l) => l.student_id === student.id);
  const studentPayments = payments.filter((p) => p.student_id === student.id);
  const studentHomework = homework.filter((h) => h.student_id === student.id);

  const completedCount = getStudentCompletedCount(student.id, lessons);
  const completedTotal = getStudentCompletedTotal(student.id, lessons);
  const paidTotal = getStudentPaidTotal(student.id, payments);
  const debt = getStudentDebt(student.id, lessons, payments);
  const lastPayment = getLastPayment(student.id, payments);

  const copyReminder = async () => {
    if (debt <= 0) {
      toast("У этого ученика нет долга", "info");
      return;
    }
    const text = REMINDER_TEMPLATE(formatCurrency(debt, student.currency), student.name.split(" ")[0]);
    const ok = await copyToClipboard(text);
    toast(ok ? "Напоминание скопировано" : "Не удалось скопировать", ok ? "success" : "error");
  };

  const handleDelete = async () => {
    await removeStudent(student.id);
    router.push("/students");
  };

  return (
    <div className="space-y-5">
      <div>
        <Button variant="ghost" asChild className="-ml-2 mb-2">
          <Link href="/students">
            <ArrowLeft className="h-4 w-4" />
            Ученики
          </Link>
        </Button>
        <PageHeader
          title={student.name}
          description={[student.subject, student.level].filter(Boolean).join(" · ") || undefined}
          actions={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => openStudent(student)}>
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
          <StudentStatusBadge status={student.status} />
          <DebtBadge debt={debt} currency={student.currency} showZeroLabel />
          <span className="text-sm text-muted-foreground">
            {formatCurrency(student.lesson_price, student.currency)} · {LESSON_FORMAT_LABELS[student.lesson_format]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Проведено занятий" value={completedCount} icon={BookOpen} tone="primary" />
        <StatCard label="Всего оплачено" value={formatCurrency(paidTotal, student.currency)} icon={Wallet} tone="success" />
        <StatCard label="Доход от ученика" value={formatCurrency(completedTotal, student.currency)} icon={GraduationCap} tone="primary" />
        <StatCard label="Текущий долг" value={formatCurrency(debt, student.currency)} icon={Clock} tone={debt > 0 ? "destructive" : "primary"} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-full overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex rounded-lg bg-secondary/70 p-0.5">
                {([
                  ["lessons", `Занятия (${studentLessons.length})`],
                  ["payments", `Оплаты (${studentPayments.length})`],
                  ["homework", `Задания (${studentHomework.length})`],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      tab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {tab === "lessons" && (
                  <Button size="sm" variant="outline" onClick={() => openLesson({ defaultStudentId: student.id })}>
                    <CalendarPlus className="h-4 w-4" /> Занятие
                  </Button>
                )}
                {tab === "payments" && (
                  <Button size="sm" variant="outline" onClick={() => openPayment({ defaultStudentId: student.id })}>
                    <Wallet className="h-4 w-4" /> Оплата
                  </Button>
                )}
                {tab === "homework" && (
                  <Button size="sm" variant="outline" onClick={() => openHomework({ defaultStudentId: student.id })}>
                    <ClipboardList className="h-4 w-4" /> Задание
                  </Button>
                )}
              </div>
            </div>
            <CardContent className="p-4">
              {tab === "lessons" &&
                (studentLessons.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">Занятий пока нет.</p>
                ) : (
                  <LessonTimeline lessons={studentLessons} currency={() => student.currency} />
                ))}
              {tab === "payments" &&
                (studentPayments.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">Оплат пока нет.</p>
                ) : (
                  <PaymentsTable payments={studentPayments} showStudent={false} />
                ))}
              {tab === "homework" &&
                (studentHomework.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">Домашних заданий пока нет.</p>
                ) : (
                  <HomeworkList homework={studentHomework} showStudent={false} />
                ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              <Button variant="secondary" onClick={() => openLesson({ defaultStudentId: student.id })}>
                <CalendarPlus className="h-4 w-4" />
                Добавить занятие
              </Button>
              <Button variant="secondary" onClick={() => openPayment({ defaultStudentId: student.id })}>
                <Wallet className="h-4 w-4" />
                Добавить оплату
              </Button>
              <Button variant="secondary" onClick={() => openHomework({ defaultStudentId: student.id })}>
                <ClipboardList className="h-4 w-4" />
                Добавить задание
              </Button>
              <Button variant="outline" onClick={copyReminder}>
                <Copy className="h-4 w-4" />
                Напомнить об оплате
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow icon={Phone} label="Телефон" value={student.phone || "—"} />
              <InfoRow icon={Mail} label="Email" value={student.email || "—"} />
              <InfoRow icon={UserCog} label="Родитель" value={student.parent_contact || "—"} />
              <InfoRow icon={NotebookPen} label="Последняя оплата" value={lastPayment ? `${formatCurrency(lastPayment.amount, student.currency)} · ${formatDate(lastPayment.payment_date)}` : "—"} />
              {student.notes && (
                <div className="border-t border-border pt-3">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Заметки</p>
                  <p className="whitespace-pre-wrap text-sm">{student.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Домашние задания</CardTitle>
          <Button size="sm" variant="outline" onClick={() => openHomework({ defaultStudentId: student.id })}>
            <ClipboardList className="h-4 w-4" />
            Задание
          </Button>
        </CardHeader>
        <CardContent>
          {studentHomework.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Домашних заданий пока нет.</p>
          ) : (
            <HomeworkList homework={studentHomework} showStudent={false} />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Удалить ученика?"
        description={`Ученик «${student.name}» и все связанные данные будут удалены безвозвратно.`}
        confirmText="Удалить"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="break-words font-medium">{value}</p>
      </div>
    </div>
  );
}
