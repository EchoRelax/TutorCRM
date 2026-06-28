import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  defaultCurrency: text("default_currency").notNull().default("RUB"),
  defaultLessonDuration: integer("default_lesson_duration").notNull().default(60),
  defaultLessonPrice: integer("default_lesson_price").notNull().default(1000),
  timezone: text("timezone").notNull().default("Europe/Moscow"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  parentContact: text("parent_contact").notNull().default(""),
  subject: text("subject").notNull().default(""),
  level: text("level").notNull().default(""),
  lessonPrice: integer("lesson_price").notNull().default(0),
  currency: text("currency").notNull().default("RUB"),
  lessonFormat: text("lesson_format").notNull().default("offline"),
  status: text("status").notNull().default("active"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  studentId: uuid("student_id").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  subject: text("subject").notNull().default(""),
  topic: text("topic").notNull().default(""),
  price: integer("price").notNull().default(0),
  status: text("status").notNull().default("scheduled"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  studentId: uuid("student_id").notNull(),
  amount: integer("amount").notNull().default(0),
  currency: text("currency").notNull().default("RUB"),
  paymentDate: text("payment_date").notNull(),
  paymentMethod: text("payment_method").notNull().default("cash"),
  comment: text("comment").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const homework = pgTable("homework", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  studentId: uuid("student_id").notNull(),
  lessonId: uuid("lesson_id"),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  assignedDate: text("assigned_date").notNull(),
  dueDate: text("due_date").notNull(),
  status: text("status").notNull().default("assigned"),
  comment: text("comment").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull().default(""),
  notes: text("notes").notNull().default(""),
  color: text("color").notNull().default("blue"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type DbUser = typeof users.$inferSelect;
export type DbProfile = typeof profiles.$inferSelect;
export type DbStudent = typeof students.$inferSelect;
export type DbLesson = typeof lessons.$inferSelect;
export type DbPayment = typeof payments.$inferSelect;
export type DbHomework = typeof homework.$inferSelect;
export type DbEvent = typeof events.$inferSelect;
