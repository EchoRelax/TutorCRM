"use server";

import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { requireUserId } from "@/lib/session";
import type {
  DbEvent,
  DbHomework,
  DbLesson,
  DbPayment,
  DbProfile,
  DbStudent,
} from "@/db/schema";
import type {
  Currency,
  Database,
  Homework,
  Lesson,
  LessonFormat,
  LessonStatus,
  New,
  Payment,
  PaymentMethod,
  Profile,
  Student,
  StudentStatus,
  TutorEvent,
} from "@/lib/types";

/* ----------------------------- mappers ----------------------------- */

function mapProfile(r: DbProfile): Profile {
  return {
    id: r.id,
    email: r.email,
    full_name: r.fullName,
    default_currency: r.defaultCurrency as Currency,
    default_lesson_duration: r.defaultLessonDuration,
    default_lesson_price: r.defaultLessonPrice,
    timezone: r.timezone,
    created_at: r.createdAt.toISOString(),
    updated_at: r.updatedAt.toISOString(),
  };
}

function mapStudent(r: DbStudent): Student {
  return {
    id: r.id,
    user_id: r.userId,
    name: r.name,
    phone: r.phone,
    email: r.email,
    parent_contact: r.parentContact,
    subject: r.subject,
    level: r.level,
    lesson_price: r.lessonPrice,
    currency: r.currency as Currency,
    lesson_format: r.lessonFormat as LessonFormat,
    status: r.status as StudentStatus,
    notes: r.notes,
    created_at: r.createdAt.toISOString(),
    updated_at: r.updatedAt.toISOString(),
  };
}

function mapLesson(r: DbLesson): Lesson {
  return {
    id: r.id,
    user_id: r.userId,
    student_id: r.studentId,
    date: r.date,
    start_time: r.startTime,
    duration_minutes: r.durationMinutes,
    subject: r.subject,
    topic: r.topic,
    price: r.price,
    status: r.status as LessonStatus,
    notes: r.notes,
    created_at: r.createdAt.toISOString(),
    updated_at: r.updatedAt.toISOString(),
  };
}

function mapPayment(r: DbPayment): Payment {
  return {
    id: r.id,
    user_id: r.userId,
    student_id: r.studentId,
    amount: r.amount,
    currency: r.currency as Currency,
    payment_date: r.paymentDate,
    payment_method: r.paymentMethod as PaymentMethod,
    comment: r.comment,
    created_at: r.createdAt.toISOString(),
    updated_at: r.updatedAt.toISOString(),
  };
}

function mapHomework(r: DbHomework): Homework {
  return {
    id: r.id,
    user_id: r.userId,
    student_id: r.studentId,
    lesson_id: r.lessonId ?? null,
    title: r.title,
    description: r.description,
    assigned_date: r.assignedDate,
    due_date: r.dueDate,
    status: r.status as Homework["status"],
    comment: r.comment,
    created_at: r.createdAt.toISOString(),
    updated_at: r.updatedAt.toISOString(),
  };
}

function mapEvent(r: DbEvent): TutorEvent {
  return {
    id: r.id,
    user_id: r.userId,
    title: r.title,
    date: r.date,
    start_time: r.startTime,
    end_time: r.endTime,
    notes: r.notes,
    color: r.color as TutorEvent["color"],
    created_at: r.createdAt.toISOString(),
    updated_at: r.updatedAt.toISOString(),
  };
}

/* ----------------------------- load ----------------------------- */

export async function loadAction(): Promise<Database> {
  const userId = await requireUserId();

  const [profileRow] = await db
    .select()
    .from(schema.profiles)
    .where(eq(schema.profiles.id, userId))
    .limit(1);

  const students = (await db.select().from(schema.students).where(eq(schema.students.userId, userId))).map(
    mapStudent
  );
  const lessons = (await db.select().from(schema.lessons).where(eq(schema.lessons.userId, userId))).map(
    mapLesson
  );
  const payments = (await db.select().from(schema.payments).where(eq(schema.payments.userId, userId))).map(
    mapPayment
  );
  const homework = (await db.select().from(schema.homework).where(eq(schema.homework.userId, userId))).map(
    mapHomework
  );
  const events = (await db.select().from(schema.events).where(eq(schema.events.userId, userId))).map(
    mapEvent
  );

  return {
    profile: profileRow ? mapProfile(profileRow) : null,
    students,
    lessons,
    payments,
    homework,
    events,
  };
}

/* ----------------------------- profile ----------------------------- */

export async function upsertProfileAction(
  data: Partial<Profile> & { id: string }
): Promise<Profile> {
  const userId = await requireUserId();
  const [row] = await db
    .insert(schema.profiles)
    .values({
      id: userId,
      email: data.email ?? "",
      fullName: data.full_name ?? "",
      defaultCurrency: data.default_currency ?? "RUB",
      defaultLessonDuration: data.default_lesson_duration ?? 60,
      defaultLessonPrice: data.default_lesson_price ?? 1000,
      timezone: data.timezone ?? "Europe/Moscow",
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.profiles.id,
      set: {
        fullName: data.full_name ?? undefined,
        defaultCurrency: data.default_currency ?? undefined,
        defaultLessonDuration: data.default_lesson_duration ?? undefined,
        defaultLessonPrice: data.default_lesson_price ?? undefined,
        timezone: data.timezone ?? undefined,
        updatedAt: new Date(),
      },
    })
    .returning();
  return mapProfile(row);
}

/* ----------------------------- students ----------------------------- */

export async function createStudentAction(data: New<Student>): Promise<Student> {
  const userId = await requireUserId();
  const [row] = await db
    .insert(schema.students)
    .values({
      userId,
      name: data.name,
      phone: data.phone ?? "",
      email: data.email ?? "",
      parentContact: data.parent_contact ?? "",
      subject: data.subject ?? "",
      level: data.level ?? "",
      lessonPrice: data.lesson_price ?? 0,
      currency: data.currency ?? "RUB",
      lessonFormat: data.lesson_format ?? "offline",
      status: data.status ?? "active",
      notes: data.notes ?? "",
    })
    .returning();
  return mapStudent(row);
}

export async function updateStudentAction(
  id: string,
  patch: Partial<Student>
): Promise<Student> {
  const userId = await requireUserId();
  const [row] = await db
    .update(schema.students)
    .set({
      name: patch.name,
      phone: patch.phone,
      email: patch.email,
      parentContact: patch.parent_contact,
      subject: patch.subject,
      level: patch.level,
      lessonPrice: patch.lesson_price,
      currency: patch.currency,
      lessonFormat: patch.lesson_format,
      status: patch.status,
      notes: patch.notes,
      updatedAt: new Date(),
    })
    .where(and(eq(schema.students.id, id), eq(schema.students.userId, userId)))
    .returning();
  if (!row) throw new Error("Ученик не найден");
  return mapStudent(row);
}

export async function deleteStudentAction(id: string): Promise<void> {
  const userId = await requireUserId();
  await db
    .delete(schema.students)
    .where(and(eq(schema.students.id, id), eq(schema.students.userId, userId)));
}

/* ----------------------------- lessons ----------------------------- */

export async function createLessonAction(data: New<Lesson>): Promise<Lesson> {
  const userId = await requireUserId();
  const [row] = await db
    .insert(schema.lessons)
    .values({
      userId,
      studentId: data.student_id,
      date: data.date,
      startTime: data.start_time,
      durationMinutes: data.duration_minutes ?? 60,
      subject: data.subject ?? "",
      topic: data.topic ?? "",
      price: data.price ?? 0,
      status: data.status ?? "scheduled",
      notes: data.notes ?? "",
    })
    .returning();
  return mapLesson(row);
}

export async function updateLessonAction(id: string, patch: Partial<Lesson>): Promise<Lesson> {
  const userId = await requireUserId();
  const [row] = await db
    .update(schema.lessons)
    .set({
      studentId: patch.student_id,
      date: patch.date,
      startTime: patch.start_time,
      durationMinutes: patch.duration_minutes,
      subject: patch.subject,
      topic: patch.topic,
      price: patch.price,
      status: patch.status,
      notes: patch.notes,
      updatedAt: new Date(),
    })
    .where(and(eq(schema.lessons.id, id), eq(schema.lessons.userId, userId)))
    .returning();
  if (!row) throw new Error("Занятие не найдено");
  return mapLesson(row);
}

export async function deleteLessonAction(id: string): Promise<void> {
  const userId = await requireUserId();
  await db
    .delete(schema.lessons)
    .where(and(eq(schema.lessons.id, id), eq(schema.lessons.userId, userId)));
}

/* ----------------------------- payments ----------------------------- */

export async function createPaymentAction(data: New<Payment>): Promise<Payment> {
  const userId = await requireUserId();
  const [row] = await db
    .insert(schema.payments)
    .values({
      userId,
      studentId: data.student_id,
      amount: data.amount,
      currency: data.currency ?? "RUB",
      paymentDate: data.payment_date,
      paymentMethod: data.payment_method ?? "cash",
      comment: data.comment ?? "",
    })
    .returning();
  return mapPayment(row);
}

export async function updatePaymentAction(id: string, patch: Partial<Payment>): Promise<Payment> {
  const userId = await requireUserId();
  const [row] = await db
    .update(schema.payments)
    .set({
      studentId: patch.student_id,
      amount: patch.amount,
      currency: patch.currency,
      paymentDate: patch.payment_date,
      paymentMethod: patch.payment_method,
      comment: patch.comment,
      updatedAt: new Date(),
    })
    .where(and(eq(schema.payments.id, id), eq(schema.payments.userId, userId)))
    .returning();
  if (!row) throw new Error("Оплата не найдена");
  return mapPayment(row);
}

export async function deletePaymentAction(id: string): Promise<void> {
  const userId = await requireUserId();
  await db
    .delete(schema.payments)
    .where(and(eq(schema.payments.id, id), eq(schema.payments.userId, userId)));
}

/* ----------------------------- homework ----------------------------- */

export async function createHomeworkAction(data: New<Homework>): Promise<Homework> {
  const userId = await requireUserId();
  const [row] = await db
    .insert(schema.homework)
    .values({
      userId,
      studentId: data.student_id,
      lessonId: data.lesson_id ?? null,
      title: data.title,
      description: data.description ?? "",
      assignedDate: data.assigned_date,
      dueDate: data.due_date,
      status: data.status ?? "assigned",
      comment: data.comment ?? "",
    })
    .returning();
  return mapHomework(row);
}

export async function updateHomeworkAction(id: string, patch: Partial<Homework>): Promise<Homework> {
  const userId = await requireUserId();
  const [row] = await db
    .update(schema.homework)
    .set({
      studentId: patch.student_id,
      lessonId: patch.lesson_id,
      title: patch.title,
      description: patch.description,
      assignedDate: patch.assigned_date,
      dueDate: patch.due_date,
      status: patch.status,
      comment: patch.comment,
      updatedAt: new Date(),
    })
    .where(and(eq(schema.homework.id, id), eq(schema.homework.userId, userId)))
    .returning();
  if (!row) throw new Error("Задание не найдено");
  return mapHomework(row);
}

export async function deleteHomeworkAction(id: string): Promise<void> {
  const userId = await requireUserId();
  await db
    .delete(schema.homework)
    .where(and(eq(schema.homework.id, id), eq(schema.homework.userId, userId)));
}

/* ----------------------------- events ----------------------------- */

export async function createEventAction(data: New<TutorEvent>): Promise<TutorEvent> {
  const userId = await requireUserId();
  const [row] = await db
    .insert(schema.events)
    .values({
      userId,
      title: data.title,
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time ?? "",
      notes: data.notes ?? "",
      color: data.color ?? "blue",
    })
    .returning();
  return mapEvent(row);
}

export async function updateEventAction(id: string, patch: Partial<TutorEvent>): Promise<TutorEvent> {
  const userId = await requireUserId();
  const [row] = await db
    .update(schema.events)
    .set({
      title: patch.title,
      date: patch.date,
      startTime: patch.start_time,
      endTime: patch.end_time,
      notes: patch.notes,
      color: patch.color,
      updatedAt: new Date(),
    })
    .where(and(eq(schema.events.id, id), eq(schema.events.userId, userId)))
    .returning();
  if (!row) throw new Error("Событие не найдено");
  return mapEvent(row);
}

export async function deleteEventAction(id: string): Promise<void> {
  const userId = await requireUserId();
  await db
    .delete(schema.events)
    .where(and(eq(schema.events.id, id), eq(schema.events.userId, userId)));
}

/* ----------------------------- demo seed ----------------------------- */

export async function resetDemoAction(): Promise<void> {
  const userId = await requireUserId();

  await db.delete(schema.homework).where(eq(schema.homework.userId, userId));
  await db.delete(schema.events).where(eq(schema.events.userId, userId));
  await db.delete(schema.payments).where(eq(schema.payments.userId, userId));
  await db.delete(schema.lessons).where(eq(schema.lessons.userId, userId));
  await db.delete(schema.students).where(eq(schema.students.userId, userId));

  const [s1, s2] = await db
    .insert(schema.students)
    .values([
      {
        userId,
        name: "Анна Смирнова",
        phone: "+7 900 123-45-67",
        subject: "Математика",
        level: "9 класс",
        lessonPrice: 1200,
        currency: "RUB",
        lessonFormat: "online",
        status: "active",
      },
      {
        userId,
        name: "Игорь Петров",
        phone: "+7 905 555-12-34",
        subject: "Физика",
        level: "11 класс",
        lessonPrice: 1500,
        currency: "RUB",
        lessonFormat: "offline",
        status: "active",
      },
    ])
    .returning();

  const today = new Date();
  const iso = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  };

  await db.insert(schema.lessons).values([
    {
      userId,
      studentId: s1.id,
      date: iso(0),
      startTime: "16:00",
      durationMinutes: 60,
      subject: "Математика",
      topic: "Производная",
      price: 1200,
      status: "scheduled",
    },
    {
      userId,
      studentId: s2.id,
      date: iso(-2),
      startTime: "18:00",
      durationMinutes: 90,
      subject: "Физика",
      topic: "Законы Ньютона",
      price: 1500,
      status: "completed",
    },
  ]);

  await db.insert(schema.payments).values([
    {
      userId,
      studentId: s2.id,
      amount: 6000,
      currency: "RUB",
      paymentDate: iso(-2),
      paymentMethod: "card",
      comment: "За 4 занятия",
    },
  ]);
}
