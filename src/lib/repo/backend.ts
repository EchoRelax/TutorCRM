import type { Database, Homework, Lesson, New, Payment, Profile, Student, TutorEvent } from "@/lib/types";

export interface Backend {
  load(): Promise<Database>;

  getProfile(): Promise<Profile | null>;
  upsertProfile(data: Partial<Profile> & { id: string }): Promise<Profile>;

  listStudents(): Promise<Student[]>;
  createStudent(data: New<Student>): Promise<Student>;
  updateStudent(id: string, patch: Partial<Student>): Promise<Student>;
  deleteStudent(id: string): Promise<void>;

  listLessons(): Promise<Lesson[]>;
  createLesson(data: New<Lesson>): Promise<Lesson>;
  updateLesson(id: string, patch: Partial<Lesson>): Promise<Lesson>;
  deleteLesson(id: string): Promise<void>;

  listPayments(): Promise<Payment[]>;
  createPayment(data: New<Payment>): Promise<Payment>;
  updatePayment(id: string, patch: Partial<Payment>): Promise<Payment>;
  deletePayment(id: string): Promise<void>;

  listHomework(): Promise<Homework[]>;
  createHomework(data: New<Homework>): Promise<Homework>;
  updateHomework(id: string, patch: Partial<Homework>): Promise<Homework>;
  deleteHomework(id: string): Promise<void>;

  listEvents(): Promise<TutorEvent[]>;
  createEvent(data: New<TutorEvent>): Promise<TutorEvent>;
  updateEvent(id: string, patch: Partial<TutorEvent>): Promise<TutorEvent>;
  deleteEvent(id: string): Promise<void>;

  resetDemo(): Promise<void>;
}
