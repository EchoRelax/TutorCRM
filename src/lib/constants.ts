import type {
  Currency,
  EventColor,
  HomeworkStatus,
  LessonFormat,
  LessonStatus,
  PaymentMethod,
  StudentStatus,
} from "./types";

export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
  active: "Активный",
  paused: "На паузе",
  archived: "Архивный",
};

export const LESSON_STATUS_LABELS: Record<LessonStatus, string> = {
  scheduled: "Запланировано",
  completed: "Проведено",
  cancelled: "Отменено",
  rescheduled: "Перенесено",
};

export const LESSON_FORMAT_LABELS: Record<LessonFormat, string> = {
  online: "Онлайн",
  offline: "Офлайн",
  mixed: "Смешанный",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Наличные",
  card: "Карта",
  bank_transfer: "Перевод",
  paypal: "PayPal",
  other: "Другое",
};

export const HOMEWORK_STATUS_LABELS: Record<HomeworkStatus, string> = {
  assigned: "Задано",
  completed: "Выполнено",
  not_completed: "Не выполнено",
};

export const CURRENCY_LABELS: Record<Currency, string> = {
  RUB: "₽",
  USD: "$",
  EUR: "€",
  KZT: "₸",
  UAH: "₴",
  BYN: "Br",
};

export const CURRENCIES: Currency[] = ["RUB", "USD", "EUR", "KZT", "UAH", "BYN"];

export const CURRENCY_OPTIONS = CURRENCIES.map((value) => ({
  value,
  label: `${value} (${CURRENCY_LABELS[value]})`,
}));

export const STUDENT_STATUS_OPTIONS = (
  Object.keys(STUDENT_STATUS_LABELS) as StudentStatus[]
).map((value) => ({ value, label: STUDENT_STATUS_LABELS[value] }));

export const LESSON_STATUS_OPTIONS = (
  Object.keys(LESSON_STATUS_LABELS) as LessonStatus[]
).map((value) => ({ value, label: LESSON_STATUS_LABELS[value] }));

export const LESSON_FORMAT_OPTIONS = (
  Object.keys(LESSON_FORMAT_LABELS) as LessonFormat[]
).map((value) => ({ value, label: LESSON_FORMAT_LABELS[value] }));

export const PAYMENT_METHOD_OPTIONS = (
  Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]
).map((value) => ({ value, label: PAYMENT_METHOD_LABELS[value] }));

export const HOMEWORK_STATUS_OPTIONS = (
  Object.keys(HOMEWORK_STATUS_LABELS) as HomeworkStatus[]
).map((value) => ({ value, label: HOMEWORK_STATUS_LABELS[value] }));

export const TIMEZONES = [
  "Europe/Moscow",
  "Europe/Kaliningrad",
  "Europe/Samara",
  "Europe/Yekaterinburg",
  "Asia/Omsk",
  "Asia/Krasnoyarsk",
  "Asia/Yakutsk",
  "Asia/Vladivostok",
  "Asia/Almaty",
  "Europe/Kiev",
  "Europe/Minsk",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
];

export const REMINDER_TEMPLATE = (amount: string, studentName: string) =>
  `Здравствуйте, ${studentName}! Напоминаю, что по занятиям накопилась задолженность: ${amount}. Буду благодарен(а) за оплату.`;

export const HOMEWORK_MESSAGE_TEMPLATE = (text: string, deadline: string) =>
  `Домашнее задание: ${text}\nДедлайн: ${deadline}`;

export const EVENT_COLOR_LABELS: Record<EventColor, string> = {
  blue: "Синий",
  green: "Зелёный",
  amber: "Оранжевый",
  red: "Красный",
  purple: "Фиолетовый",
  gray: "Серый",
};

export const EVENT_COLOR_OPTIONS = (Object.keys(EVENT_COLOR_LABELS) as EventColor[]).map((value) => ({
  value,
  label: EVENT_COLOR_LABELS[value],
}));

export const EVENT_COLOR_DOT: Record<EventColor, string> = {
  blue: "dot-sage",
  green: "dot-mint",
  amber: "dot-caramel",
  red: "dot-clay",
  purple: "dot-mauve",
  gray: "dot-neutral",
};

export const EVENT_COLOR_CHIP: Record<EventColor, string> = {
  blue: "ev-sage",
  green: "ev-mint",
  amber: "ev-caramel",
  red: "ev-clay",
  purple: "ev-mauve",
  gray: "ev-neutral",
};

export const TIME_OPTIONS: { value: string; label: string }[] = (() => {
  const opts: { value: string; label: string }[] = [];
  for (let h = 7; h <= 22; h++) {
    const hh = String(h).padStart(2, "0");
    opts.push({ value: `${hh}:00`, label: `${hh}:00` });
    opts.push({ value: `${hh}:30`, label: `${hh}:30` });
  }
  return opts;
})();

export const TIME_OPTIONS_WITH_EMPTY = [{ value: "", label: "Без окончания" }, ...TIME_OPTIONS];

export const FREE_STUDENT_LIMIT = 5;

export const LIFETIME_TOTAL_SPOTS = 100;
export const LIFETIME_TAKEN_SPOTS = 53;

export const PRO_FEATURES = [
  "Неограниченное число учеников",
  "Все форматы экспорта аналитики",
  "Личные события и расписание",
  "История без ограничений",
  "Приоритетная поддержка",
];
