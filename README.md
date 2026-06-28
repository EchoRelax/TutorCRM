# TutorCRM

Простая CRM для частных репетиторов: ученики, занятия, оплаты, долги, домашние задания и заметки — в одном месте.

Стек: **Next.js 16 (App Router) · React 19 · TypeScript · чистый CSS (без Tailwind) · PostgreSQL + Drizzle ORM · JWT-авторизация (jose + bcrypt) · anime.js**.

---

## Архитектура

- **База данных**: PostgreSQL. Схема описана типизированно через Drizzle (`src/db/schema.ts`), 7 таблиц (`users`, `profiles`, `students`, `lessons`, `payments`, `homework`, `events`). Данные каждого репетитора изолированы по `user_id`.
- **Авторизация**: email + пароль. Пароль — `bcrypt`, сессия — подписанный JWT (HS256) в `httpOnly`-куке (`jose`). Защита роутов — `src/proxy.ts` (Next 16, edge), публичны только `/login` и `/register`.
- **Слой данных**: серверные действия (Server Actions) в `src/lib/actions/` (`auth.ts`, `data.ts`). UI не трогает БД напрямую — `DataProvider` ходит через тонкий shim `src/lib/repo`, совместимый с прежним интерфейсом `Backend`.

---

## Запуск (локально)

Нужен Docker для Postgres (или любой запущенный PostgreSQL).

```bash
# 1. Поднять Postgres
docker compose up -d

# 2. Переменные окружения
cp .env.example .env.local
#   заполнить AUTH_SECRET:  openssl rand -base64 32

# 3. Зависимости
npm install

# 4. Применить схему БД (создаст таблицы)
npm run db:push
#   либо npm run db:migrate  (по сгенерированным миграциям в ./drizzle)

# 5. Запуск
npm run dev      # http://localhost:3000
```

Затем зарегистрируйтесь на `/register` или войдите через «Демо-вход». Демо-данные можно наполнить кнопкой «Восстановить демо-данные» в Настройках.

## Скрипты БД (Drizzle)

```bash
npm run db:generate   # сгенерировать SQL-миграцию из схемы
npm run db:push       # применить схему к БД напрямую (dev)
npm run db:migrate    # применить миграции из ./drizzle
npm run db:studio     # визуальный просмотр БД (Drizzle Studio)
```

## Проверки

```bash
npm run typecheck
npm run lint
npm run build
```

## Переменные окружения

| Переменная     | Назначение                                      | Пример |
|----------------|-------------------------------------------------|--------|
| `DATABASE_URL` | Строка подключения к PostgreSQL                 | `postgres://postgres:postgres@localhost:5432/tutorcrm` |
| `AUTH_SECRET`  | Секрет для подписи JWT (генерируйте случайно)   | `openssl rand -base64 32` |

## Деплой на VPS

1. Установить Node 20+, Nginx, PM2, Docker (или системный Postgres).
2. Клонировать репозиторий, `npm ci`.
3. Поднять БД: `docker compose up -d` (или внешний managed Postgres), прописать `.env` (`DATABASE_URL`, `AUTH_SECRET`).
4. Применить схему: `npm run db:push` (или `db:migrate`).
5. Собрать: `npm run build`.
6. Запустить: `pm2 start "npm run start" --name crm && pm2 save && pm2 startup`.
7. Nginx — reverse proxy на `127.0.0.1:3000`, HTTPS через `certbot --nginx`.

Обновления: `git pull && npm ci && npm run db:migrate && npm run build && pm2 restart crm`.

---

## Структура

```
src/
├── app/                  # маршруты (App Router): (auth), (app), proxy.ts
├── components/           # UI-примитивы, layout, таблицы, формы, дашборд-блоки
├── context/              # Auth, Data, Toast, QuickAdd, Subscription, Theme
├── db/                   # Drizzle: schema.ts, client.ts
├── lib/
│   ├── actions/          # серверные действия: auth.ts, data.ts
│   ├── auth.ts           # JWT sign/verify (jose, edge-safe)
│   ├── session.ts        # чтение сессии (server)
│   ├── repo/             # shim createBackend() → server actions
│   ├── types, constants, calc, validation, exporters
└── proxy.ts              # защита роутов (Next 16)
```

## Что осталось на будущее

- Онлайн-оплата и счета/инvoices.
- «Кабинет ученика» (потребует публичных роутов + прав доступа).
- Резервное копирование БД (pg_dump по расписанию).
- Экспорт/импорт данных пользователя.
