import { isSameDay, parseISO } from "date-fns";
import type { Lesson, Payment, Student } from "./types";

/**
 * Долг ученика = сумма цен проведённых (completed) занятий
 * минус сумма всех оплат ученика.
 * Отменённые и запланированные занятия долг не увеличивают.
 */
export function getStudentDebt(
  studentId: string,
  lessons: Lesson[],
  payments: Payment[]
): number {
  const completedTotal = lessons
    .filter((l) => l.student_id === studentId && l.status === "completed")
    .reduce((sum, l) => sum + (l.price || 0), 0);

  const paidTotal = payments
    .filter((p) => p.student_id === studentId)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return round2(completedTotal - paidTotal);
}

/** Сколько ученик всего оплатил. */
export function getStudentPaidTotal(studentId: string, payments: Payment[]): number {
  return round2(
    payments
      .filter((p) => p.student_id === studentId)
      .reduce((sum, p) => sum + (p.amount || 0), 0)
  );
}

/** Сумма всех проведённых занятий ученика (доход, который должен был поступить). */
export function getStudentCompletedTotal(studentId: string, lessons: Lesson[]): number {
  return round2(
    lessons
      .filter((l) => l.student_id === studentId && l.status === "completed")
      .reduce((sum, l) => sum + (l.price || 0), 0)
  );
}

/** Кол-во проведённых занятий. */
export function getStudentCompletedCount(studentId: string, lessons: Lesson[]): number {
  return lessons.filter((l) => l.student_id === studentId && l.status === "completed").length;
}

/** Последняя оплата ученика (по дате). */
export function getLastPayment(studentId: string, payments: Payment[]): Payment | null {
  const list = payments
    .filter((p) => p.student_id === studentId)
    .sort((a, b) => (a.payment_date < b.payment_date ? 1 : -1));
  return list[0] ?? null;
}

/** Кол-во неоплаченных проведённых занятий (упрощённо: долг > 0). */
export function getUnpaidLessonCount(
  studentId: string,
  lessons: Lesson[],
  payments: Payment[]
): number {
  // Считаем количество проведённых занятий, которые "покрываются" текущим долгом.
  const debt = getStudentDebt(studentId, lessons, payments);
  if (debt <= 0) return 0;
  const completed = lessons
    .filter((l) => l.student_id === studentId && l.status === "completed")
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  // Покрываем оплаты с конца — оцениваем сколько последних занятий не оплачено.
  let remaining = debt;
  let count = 0;
  for (let i = completed.length - 1; i >= 0; i--) {
    if (remaining <= 0.001) break;
    remaining -= completed[i].price;
    count++;
  }
  return count;
}

/** Доход за месяц — сумма оплат с payment_date в текущем месяце. */
export function getMonthlyIncome(payments: Payment[], reference: Date = new Date()): number {
  const ref = parseISO(reference.toISOString());
  const month = ref.getMonth();
  const year = ref.getFullYear();
  return round2(
    payments
      .filter((p) => {
        const d = parseISO(p.payment_date);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0)
  );
}

/** Занятия на сегодня (запланированные или проведённые). */
export function getTodayLessons(lessons: Lesson[], reference: Date = new Date()): Lesson[] {
  return lessons
    .filter(
      (l) =>
        (l.status === "scheduled" || l.status === "completed") &&
        isSameDay(parseISO(l.date), reference)
    )
    .sort((a, b) => (a.start_time < b.start_time ? -1 : 1));
}

/** Активные ученики. */
export function getActiveStudents(students: Student[]): Student[] {
  return students.filter((s) => s.status === "active");
}

/** Общий долг по всем ученикам. */
export function getTotalDebt(
  students: Student[],
  lessons: Lesson[],
  payments: Payment[]
): number {
  return round2(
    students.reduce((sum, s) => sum + getStudentDebt(s.id, lessons, payments), 0)
  );
}

/** Список должников (долг > 0) с суммой и кол-вом неоплаченных занятий. */
export function getDebtors(
  students: Student[],
  lessons: Lesson[],
  payments: Payment[]
): Array<{ student: Student; debt: number; unpaidCount: number }> {
  return students
    .map((student) => ({
      student,
      debt: getStudentDebt(student.id, lessons, payments),
      unpaidCount: getUnpaidLessonCount(student.id, lessons, payments),
    }))
    .filter((row) => row.debt > 0.001)
    .sort((a, b) => b.debt - a.debt);
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Распределяет оплаты ученика по его проведённым занятиям (от старых к новым).
 * Возвращает Map<lessonId, boolean>, где true = занятие оплачено.
 * Применяется только к completed-занятиям; остальные считаются «не применимо».
 */
export function computePaidMap(
  studentId: string,
  lessons: Lesson[],
  payments: Payment[]
): Map<string, boolean> {
  const map = new Map<string, boolean>();
  const completed = lessons
    .filter((l) => l.student_id === studentId && l.status === "completed")
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.start_time < b.start_time ? -1 : 1));
  let remaining = payments
    .filter((p) => p.student_id === studentId)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  for (const lesson of completed) {
    if (remaining >= lesson.price - 0.001) {
      remaining = round2(remaining - lesson.price);
      map.set(lesson.id, true);
    } else {
      map.set(lesson.id, false);
    }
  }
  return map;
}
