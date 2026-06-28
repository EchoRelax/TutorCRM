"use client";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import {
  HOMEWORK_STATUS_LABELS,
  LESSON_STATUS_LABELS,
  STUDENT_STATUS_LABELS,
} from "@/lib/constants";
import type { HomeworkStatus, LessonStatus, StudentStatus } from "@/lib/types";

type BadgeVariant = BadgeProps["variant"];

const LESSON_VARIANTS: Record<LessonStatus, BadgeVariant> = {
  scheduled: "default",
  completed: "success",
  cancelled: "destructive",
  rescheduled: "warning",
};

const STUDENT_VARIANTS: Record<StudentStatus, BadgeVariant> = {
  active: "success",
  paused: "warning",
  archived: "muted",
};

const HOMEWORK_VARIANTS: Record<HomeworkStatus, BadgeVariant> = {
  assigned: "secondary",
  completed: "success",
  not_completed: "destructive",
};

interface StatusBadgeProps {
  kind: "lesson";
  status: LessonStatus;
}

export function StatusBadge({ kind, status }: StatusBadgeProps) {
  if (kind === "lesson") {
    return (
      <Badge variant={LESSON_VARIANTS[status]}>{LESSON_STATUS_LABELS[status]}</Badge>
    );
  }
  return null;
}

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  return <Badge variant={STUDENT_VARIANTS[status]}>{STUDENT_STATUS_LABELS[status]}</Badge>;
}

export function HomeworkStatusBadge({ status }: { status: HomeworkStatus }) {
  return <Badge variant={HOMEWORK_VARIANTS[status]}>{HOMEWORK_STATUS_LABELS[status]}</Badge>;
}
