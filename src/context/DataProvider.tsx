"use client";

import * as React from "react";
import { useAuth } from "./AuthProvider";
import { createBackend } from "@/lib/repo";
import type { Backend } from "@/lib/repo/backend";
import type {
  Database,
  Homework,
  Lesson,
  New,
  Payment,
  Profile,
  Student,
  TutorEvent,
} from "@/lib/types";
import { getStudentDebt } from "@/lib/calc";

interface DataContextValue extends Database {
  loading: boolean;
  error: string | null;
  backend: Backend | null;
  refresh: () => Promise<void>;

  addStudent: (data: New<Student>) => Promise<Student>;
  updateStudent: (id: string, patch: Partial<Student>) => Promise<Student>;
  removeStudent: (id: string) => Promise<void>;

  addLesson: (data: New<Lesson>) => Promise<Lesson>;
  updateLesson: (id: string, patch: Partial<Lesson>) => Promise<Lesson>;
  removeLesson: (id: string) => Promise<void>;

  addPayment: (data: New<Payment>) => Promise<Payment>;
  updatePayment: (id: string, patch: Partial<Payment>) => Promise<Payment>;
  removePayment: (id: string) => Promise<void>;

  addHomework: (data: New<Homework>) => Promise<Homework>;
  updateHomework: (id: string, patch: Partial<Homework>) => Promise<Homework>;
  removeHomework: (id: string) => Promise<void>;

  addEvent: (data: New<TutorEvent>) => Promise<TutorEvent>;
  updateEvent: (id: string, patch: Partial<TutorEvent>) => Promise<TutorEvent>;
  removeEvent: (id: string) => Promise<void>;

  saveProfile: (data: Partial<Profile> & { id: string }) => Promise<Profile>;
  resetDemo: () => Promise<void>;

  getStudent: (id: string) => Student | undefined;
  studentDebt: (id: string) => number;
}

const DataContext = React.createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = React.useState<Database>({
    profile: null,
    students: [],
    lessons: [],
    payments: [],
    homework: [],
    events: [],
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const backend = React.useMemo(() => (user ? createBackend(user.id) : null), [user]);

  const refresh = React.useCallback(async () => {
    if (!backend) return;
    try {
      setError(null);
      const db = await backend.load();
      setData(db);
      if (!db.profile && user) {
        const profile = await backend.upsertProfile({
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          default_currency: "RUB",
          default_lesson_duration: 60,
          default_lesson_price: 1000,
          timezone: "Europe/Moscow",
        });
        setData((prev) => ({ ...db, profile }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  }, [backend, user]);

  React.useEffect(() => {
    if (!user) {
      setData({ profile: null, students: [], lessons: [], payments: [], homework: [], events: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    refresh();
  }, [user, refresh]);

  const wrap = React.useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      try {
        const result = await fn();
        return result;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Произошла ошибка");
        throw e;
      }
    },
    []
  );

  const mutateAndSync = React.useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      const result = await wrap(fn);
      await refresh();
      return result;
    },
    [wrap, refresh]
  );

  const value = React.useMemo<DataContextValue>(
    () => ({
      ...data,
      loading,
      error,
      backend,
      refresh,
      addStudent: (d) => mutateAndSync(() => backend!.createStudent(d)),
      updateStudent: (id, patch) => mutateAndSync(() => backend!.updateStudent(id, patch)),
      removeStudent: (id) => mutateAndSync(() => backend!.deleteStudent(id)),
      addLesson: (d) => mutateAndSync(() => backend!.createLesson(d)),
      updateLesson: (id, patch) => mutateAndSync(() => backend!.updateLesson(id, patch)),
      removeLesson: (id) => mutateAndSync(() => backend!.deleteLesson(id)),
      addPayment: (d) => mutateAndSync(() => backend!.createPayment(d)),
      updatePayment: (id, patch) => mutateAndSync(() => backend!.updatePayment(id, patch)),
      removePayment: (id) => mutateAndSync(() => backend!.deletePayment(id)),
      addHomework: (d) => mutateAndSync(() => backend!.createHomework(d)),
      updateHomework: (id, patch) => mutateAndSync(() => backend!.updateHomework(id, patch)),
      removeHomework: (id) => mutateAndSync(() => backend!.deleteHomework(id)),
      addEvent: (d) => mutateAndSync(() => backend!.createEvent(d)),
      updateEvent: (id, patch) => mutateAndSync(() => backend!.updateEvent(id, patch)),
      removeEvent: (id) => mutateAndSync(() => backend!.deleteEvent(id)),
      saveProfile: (d) => mutateAndSync(() => backend!.upsertProfile(d)),
      resetDemo: () => mutateAndSync(() => backend!.resetDemo()),
      getStudent: (id) => data.students.find((s) => s.id === id),
      studentDebt: (id) => getStudentDebt(id, data.lessons, data.payments),
    }),
    [data, loading, error, backend, refresh, mutateAndSync]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = React.useContext(DataContext);
  if (!ctx) throw new Error("useData должен использоваться внутри <DataProvider>");
  return ctx;
}
