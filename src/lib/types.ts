export type StudentStatus = "active" | "paused" | "archived";

export type LessonStatus = "scheduled" | "completed" | "cancelled" | "rescheduled";

export type LessonFormat = "online" | "offline" | "mixed";

export type PaymentMethod = "cash" | "card" | "bank_transfer" | "paypal" | "other";

export type HomeworkStatus = "assigned" | "completed" | "not_completed";

export type EventColor = "blue" | "green" | "amber" | "red" | "purple" | "gray";

export type Currency = "RUB" | "USD" | "EUR" | "KZT" | "UAH" | "BYN";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  default_currency: Currency;
  default_lesson_duration: number;
  default_lesson_price: number;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string;
  parent_contact: string;
  subject: string;
  level: string;
  lesson_price: number;
  currency: Currency;
  lesson_format: LessonFormat;
  status: StudentStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  user_id: string;
  student_id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  duration_minutes: number;
  subject: string;
  topic: string;
  price: number;
  status: LessonStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  student_id: string;
  amount: number;
  currency: Currency;
  payment_date: string; // YYYY-MM-DD
  payment_method: PaymentMethod;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface Homework {
  id: string;
  user_id: string;
  student_id: string;
  lesson_id: string | null;
  title: string;
  description: string;
  assigned_date: string; // YYYY-MM-DD
  due_date: string; // YYYY-MM-DD
  status: HomeworkStatus;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface TutorEvent {
  id: string;
  user_id: string;
  title: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  notes: string;
  color: EventColor;
  created_at: string;
  updated_at: string;
}

export type New<T> = Omit<T, "id" | "created_at" | "updated_at">;

export interface Database {
  profile: Profile | null;
  students: Student[];
  lessons: Lesson[];
  payments: Payment[];
  homework: Homework[];
  events: TutorEvent[];
}
