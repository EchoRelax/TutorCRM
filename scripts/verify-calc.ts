import {
  getStudentDebt,
  getMonthlyIncome,
  getActiveStudents,
  getTotalDebt,
  getDebtors,
  computePaidMap,
  getUnpaidLessonCount,
} from "../src/lib/calc";
import type { Lesson, Payment, Student } from "../src/lib/types";

const mkStudent = (id: string): Student =>
  ({
    id,
    user_id: "u",
    name: id,
    phone: "",
    email: "",
    parent_contact: "",
    subject: "",
    level: "",
    lesson_price: 2000,
    currency: "RUB",
    lesson_format: "online",
    status: "active",
    notes: "",
    created_at: "",
    updated_at: "",
  }) as Student;

const lessons: Lesson[] = [
  { id: "l1", user_id: "u", student_id: "s1", date: "2026-06-10", start_time: "10:00", duration_minutes: 60, subject: "", topic: "", price: 2000, status: "completed", notes: "", created_at: "", updated_at: "" },
  { id: "l2", user_id: "u", student_id: "s1", date: "2026-06-17", start_time: "10:00", duration_minutes: 60, subject: "", topic: "", price: 2000, status: "completed", notes: "", created_at: "", updated_at: "" },
  { id: "l3", user_id: "u", student_id: "s1", date: "2026-06-24", start_time: "10:00", duration_minutes: 60, subject: "", topic: "", price: 2000, status: "completed", notes: "", created_at: "", updated_at: "" },
  { id: "l4", user_id: "u", student_id: "s1", date: "2026-06-25", start_time: "10:00", duration_minutes: 60, subject: "", topic: "", price: 2000, status: "scheduled", notes: "", created_at: "", updated_at: "" },
  { id: "l5", user_id: "u", student_id: "s1", date: "2026-06-09", start_time: "10:00", duration_minutes: 60, subject: "", topic: "", price: 2000, status: "cancelled", notes: "", created_at: "", updated_at: "" },
];

const payments: Payment[] = [
  { id: "p1", user_id: "u", student_id: "s1", amount: 4000, currency: "RUB", payment_date: "2026-06-15", payment_method: "card", comment: "", created_at: "", updated_at: "" },
];

const students = [mkStudent("s1")];

function assert(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}: got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
  if (!ok) process.exitCode = 1;
}

// Scenario 2: 3 completed × 2000 = 6000, paid 4000 → debt 2000
assert("debt = 2000", getStudentDebt("s1", lessons, payments), 2000);
// monthly income: payment in current month (June 2026) = 4000
assert("monthly income = 4000", getMonthlyIncome(payments, new Date("2026-06-24")), 4000);
// active students = 1
assert("active = 1", getActiveStudents(students).length, 1);
// total debt = 2000
assert("total debt = 2000", getTotalDebt(students, lessons, payments), 2000);
// debtors includes s1
assert("debtors count = 1", getDebtors(students, lessons, payments).length, 1);
// unpaid lesson count = 1 (last completed not covered)
assert("unpaid count = 1", getUnpaidLessonCount("s1", lessons, payments), 1);
// paid map: l1,l2 paid; l3 unpaid; l4,l5 not in map (scheduled/cancelled)
const pm = computePaidMap("s1", lessons, payments);
assert("paid map l1=true", pm.get("l1"), true);
assert("paid map l2=true", pm.get("l2"), true);
assert("paid map l3=false", pm.get("l3"), false);
assert("paid map l4=undefined", pm.get("l4"), undefined);

// After full payment, debt = 0
const fullPay = [...payments, { ...payments[0], id: "p2", amount: 2000 }];
assert("debt after full pay = 0", getStudentDebt("s1", lessons, fullPay), 0);
assert("debtors after full pay = 0", getDebtors(students, lessons, fullPay).length, 0);
