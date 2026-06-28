import type { Backend } from "./backend";
import type {
  Homework,
  Lesson,
  Payment,
  Profile,
  Student,
  TutorEvent,
} from "@/lib/types";
import * as data from "@/lib/actions/data";

/**
 * Server-backed backend. Each method delegates to a Server Action that
 * resolves the current user from the session and queries PostgreSQL.
 * The `userId` argument is ignored — actions read the session themselves
 * (so data is always isolated to the authenticated user).
 */
export function createBackend(_userId: string): Backend {
  const loadAll = () => data.loadAction();

  return {
    load: loadAll,
    getProfile: async () => (await loadAll()).profile,
    upsertProfile: (d) => data.upsertProfileAction(d),

    listStudents: async () => (await loadAll()).students,
    createStudent: (d) => data.createStudentAction(d),
    updateStudent: (id, patch) => data.updateStudentAction(id, patch),
    deleteStudent: (id) => data.deleteStudentAction(id),

    listLessons: async () => (await loadAll()).lessons,
    createLesson: (d) => data.createLessonAction(d),
    updateLesson: (id, patch) => data.updateLessonAction(id, patch),
    deleteLesson: (id) => data.deleteLessonAction(id),

    listPayments: async () => (await loadAll()).payments,
    createPayment: (d) => data.createPaymentAction(d),
    updatePayment: (id, patch) => data.updatePaymentAction(id, patch),
    deletePayment: (id) => data.deletePaymentAction(id),

    listHomework: async () => (await loadAll()).homework,
    createHomework: (d) => data.createHomeworkAction(d),
    updateHomework: (id, patch) => data.updateHomeworkAction(id, patch),
    deleteHomework: (id) => data.deleteHomeworkAction(id),

    listEvents: async () => (await loadAll()).events,
    createEvent: (d) => data.createEventAction(d),
    updateEvent: (id, patch) => data.updateEventAction(id, patch),
    deleteEvent: (id) => data.deleteEventAction(id),

    resetDemo: () => data.resetDemoAction(),
  };
}

// keep type-only re-exports used elsewhere
export type { Backend } from "./backend";
export type { Profile, Student, Lesson, Payment, Homework, TutorEvent } from "@/lib/types";
