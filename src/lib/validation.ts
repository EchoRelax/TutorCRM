import { z } from "zod";

const optionalEmail = z
  .string()
  .trim()
  .email("Некорректный email")
  .optional()
  .or(z.literal(""));

export const studentSchema = z.object({
  name: z.string({ required_error: "Введите имя" }).trim().min(1, "Введите имя"),
  phone: z.string().trim().optional(),
  email: optionalEmail,
  parent_contact: z.string().trim().optional(),
  subject: z.string().trim().optional(),
  level: z.string().trim().optional(),
  lesson_price: z.coerce
    .number({ invalid_type_error: "Цена должна быть числом", required_error: "Укажите цену" })
    .min(0, "Цена должна быть 0 или больше"),
  currency: z.enum(["RUB", "USD", "EUR", "KZT", "UAH", "BYN"]),
  lesson_format: z.enum(["online", "offline", "mixed"]),
  status: z.enum(["active", "paused", "archived"]),
  notes: z.string().trim().optional(),
});

export const lessonSchema = z.object({
  student_id: z.string({ required_error: "Выберите ученика" }).min(1, "Выберите ученика"),
  date: z.string({ required_error: "Выберите дату" }).min(1, "Выберите дату"),
  start_time: z.string({ required_error: "Укажите время" }).min(1, "Укажите время"),
  duration_minutes: z.coerce
    .number({ invalid_type_error: "Длительность должна быть числом" })
    .int()
    .min(1, "Длительность должна быть больше 0"),
  subject: z.string().trim().optional(),
  topic: z.string().trim().optional(),
  price: z.coerce
    .number({ invalid_type_error: "Цена должна быть числом" })
    .min(0, "Цена должна быть 0 или больше"),
  status: z.enum(["scheduled", "completed", "cancelled", "rescheduled"]),
  notes: z.string().trim().optional(),
});

export const paymentSchema = z.object({
  student_id: z.string({ required_error: "Выберите ученика" }).min(1, "Выберите ученика"),
  payment_date: z.string({ required_error: "Выберите дату" }).min(1, "Выберите дату"),
  amount: z.coerce
    .number({ invalid_type_error: "Сумма должна быть числом", required_error: "Укажите сумму" })
    .positive("Сумма должна быть больше 0"),
  payment_method: z.enum(["cash", "card", "bank_transfer", "paypal", "other"]),
  comment: z.string().trim().optional(),
});

export const homeworkSchema = z.object({
  student_id: z.string({ required_error: "Выберите ученика" }).min(1, "Выберите ученика"),
  title: z.string({ required_error: "Введите название" }).trim().min(1, "Введите название"),
  description: z.string().trim().optional(),
  assigned_date: z.string({ required_error: "Выберите дату" }).min(1, "Выберите дату"),
  due_date: z.string({ required_error: "Выберите дедлайн" }).min(1, "Выберите дедлайн"),
  status: z.enum(["assigned", "completed", "not_completed"]),
  comment: z.string().trim().optional(),
});

export const eventSchema = z.object({
  title: z.string({ required_error: "Введите название" }).trim().min(1, "Введите название"),
  date: z.string({ required_error: "Выберите дату" }).min(1, "Выберите дату"),
  start_time: z.string({ required_error: "Укажите время начала" }).min(1, "Укажите время начала"),
  end_time: z.string().trim().optional(),
  color: z.enum(["blue", "green", "amber", "red", "purple", "gray"]),
  notes: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: z.string({ required_error: "Введите email" }).trim().email("Некорректный email"),
  password: z.string({ required_error: "Введите пароль" }).min(1, "Введите пароль"),
});

export const registerSchema = z
  .object({
    full_name: z.string({ required_error: "Введите имя" }).trim().min(1, "Введите имя"),
    email: z.string({ required_error: "Введите email" }).trim().email("Некорректный email"),
    password: z.string({ required_error: "Введите пароль" }).min(6, "Минимум 6 символов"),
    confirm: z.string({ required_error: "Повторите пароль" }).min(6, "Минимум 6 символов"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Пароли не совпадают",
    path: ["confirm"],
  });

export type StudentFormValues = z.infer<typeof studentSchema>;
export type LessonFormValues = z.infer<typeof lessonSchema>;
export type PaymentFormValues = z.infer<typeof paymentSchema>;
export type HomeworkFormValues = z.infer<typeof homeworkSchema>;
export type EventFormValues = z.infer<typeof eventSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
