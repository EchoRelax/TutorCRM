"use server";

import { cookies, headers } from "next/headers";
import { and, eq, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";
import { db, schema } from "@/db/client";
import {
  signSession,
  signTwoFactorTicket,
  verifySession,
  verifyTwoFactorTicket,
  SESSION_COOKIE,
} from "@/lib/auth";
import { getCurrentSessionId } from "@/lib/session";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
}

const MAX_AGE = 60 * 60 * 24 * 30;
const ISSUER = "TutorCRM";

async function getRequestInfo() {
  const h = await headers();
  const userAgent = h.get("user-agent") ?? "Неизвестное устройство";
  const ip =
    (h.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
    h.get("x-real-ip") ||
    "";
  return { userAgent, ip };
}

async function createSessionToken(userId: string): Promise<string> {
  const { userAgent, ip } = await getRequestInfo();
  const [session] = await db
    .insert(schema.sessions)
    .values({ userId, userAgent, ip })
    .returning();
  return signSession(userId, session.id);
}

async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/* ----------------------------- auth ----------------------------- */

export type LoginResult = { status: "ok"; user: AuthUser } | { status: "2fa"; ticket: string };

export async function registerAction(
  fullName: string,
  email: string,
  password: string
): Promise<AuthUser> {
  const normalized = email.trim().toLowerCase();
  const name = fullName.trim();
  if (!name) throw new Error("Укажите имя");
  if (password.length < 6) throw new Error("Пароль должен быть не короче 6 символов");

  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, normalized))
    .limit(1);
  if (existing.length > 0) {
    throw new Error("Пользователь с таким email уже зарегистрирован.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(schema.users)
    .values({ email: normalized, passwordHash, fullName: name })
    .returning();

  await db
    .insert(schema.profiles)
    .values({ id: user.id, email: normalized, fullName: name });

  const token = await createSessionToken(user.id);
  await setSessionCookie(token);
  return { id: user.id, email: user.email, full_name: user.fullName };
}

export async function loginAction(email: string, password: string): Promise<LoginResult> {
  const normalized = email.trim().toLowerCase();
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, normalized))
    .limit(1);
  if (!user) throw new Error("Неверный email или пароль.");
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("Неверный email или пароль.");

  if (user.twoFactorEnabled && user.twoFactorSecret) {
    const ticket = await signTwoFactorTicket(user.id);
    return { status: "2fa", ticket };
  }

  const token = await createSessionToken(user.id);
  await setSessionCookie(token);
  return { status: "ok", user: { id: user.id, email: user.email, full_name: user.fullName } };
}

export async function verifyTwoFactorAction(
  ticket: string,
  code: string
): Promise<AuthUser> {
  const payload = await verifyTwoFactorTicket(ticket);
  if (!payload) throw new Error("Сессия истекла, начните вход заново.");
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, payload.userId))
    .limit(1);
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new Error("Двухэтапная аутентификация не настроена.");
  }
  const valid = verifySync({ token: code.replace(/\s/g, ""), secret: user.twoFactorSecret });
  if (!valid.valid) throw new Error("Неверный код подтверждения.");

  const token = await createSessionToken(user.id);
  await setSessionCookie(token);
  return { id: user.id, email: user.email, full_name: user.fullName };
}

export async function logoutAction(): Promise<void> {
  const sessionId = await getCurrentSessionId();
  if (sessionId) {
    await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
  }
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUserAction(): Promise<AuthUser | null> {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const [row] = await db
    .select({ id: schema.sessions.id })
    .from(schema.sessions)
    .where(
      and(eq(schema.sessions.id, session.sessionId), eq(schema.sessions.userId, session.userId))
    )
    .limit(1);
  if (!row) return null;
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, session.userId))
    .limit(1);
  if (!user) return null;
  return { id: user.id, email: user.email, full_name: user.fullName };
}

/* ----------------------------- 2FA ----------------------------- */

export interface TwoFactorSetup {
  secret: string;
  otpauthUri: string;
  qr: string;
}

export async function setupTwoFactorAction(): Promise<TwoFactorSetup> {
  const userId = await requireUserIdFromCookie();
  const secret = generateSecret();
  const [user] = await db
    .select({ email: schema.users.email })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  const otpauthUri = generateURI({ issuer: ISSUER, label: user?.email ?? "user", secret });
  await db
    .update(schema.users)
    .set({ twoFactorSecret: secret })
    .where(eq(schema.users.id, userId));
  const qr = await QRCode.toDataURL(otpauthUri, { margin: 1, width: 200 });
  return { secret, otpauthUri, qr };
}

export async function enableTwoFactorAction(code: string): Promise<void> {
  const userId = await requireUserIdFromCookie();
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  if (!user || !user.twoFactorSecret) {
    throw new Error("Сначала создайте секретный ключ.");
  }
  const valid = verifySync({ token: code.replace(/\s/g, ""), secret: user.twoFactorSecret });
  if (!valid.valid) throw new Error("Неверный код. Попробуйте снова.");
  await db
    .update(schema.users)
    .set({ twoFactorEnabled: true })
    .where(eq(schema.users.id, userId));
}

export async function disableTwoFactorAction(): Promise<void> {
  const userId = await requireUserIdFromCookie();
  await db
    .update(schema.users)
    .set({ twoFactorEnabled: false, twoFactorSecret: null })
    .where(eq(schema.users.id, userId));
}

export async function getTwoFactorStatusAction(): Promise<boolean> {
  const userId = await requireUserIdFromCookie();
  const [user] = await db
    .select({ enabled: schema.users.twoFactorEnabled })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  return Boolean(user?.enabled);
}

async function requireUserIdFromCookie(): Promise<string> {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) throw new Error("Необходима авторизация");
  const [row] = await db
    .select({ id: schema.sessions.id })
    .from(schema.sessions)
    .where(
      and(eq(schema.sessions.id, session.sessionId), eq(schema.sessions.userId, session.userId))
    )
    .limit(1);
  if (!row) throw new Error("Необходима авторизация");
  return session.userId;
}

/* ----------------------------- sessions ----------------------------- */

export interface SessionInfo {
  id: string;
  userAgent: string;
  ip: string;
  createdAt: string;
  lastSeenAt: string;
  current: boolean;
}

export async function listSessionsAction(): Promise<SessionInfo[]> {
  const userId = await requireUserIdFromCookie();
  const currentId = await getCurrentSessionId();
  const rows = await db
    .select()
    .from(schema.sessions)
    .where(eq(schema.sessions.userId, userId));
  return rows
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((r) => ({
      id: r.id,
      userAgent: r.userAgent,
      ip: r.ip,
      createdAt: r.createdAt.toISOString(),
      lastSeenAt: r.lastSeenAt.toISOString(),
      current: r.id === currentId,
    }));
}

export async function revokeSessionAction(id: string): Promise<void> {
  const userId = await requireUserIdFromCookie();
  await db
    .delete(schema.sessions)
    .where(and(eq(schema.sessions.id, id), eq(schema.sessions.userId, userId)));
}

export async function revokeOtherSessionsAction(): Promise<void> {
  const userId = await requireUserIdFromCookie();
  const currentId = await getCurrentSessionId();
  await db
    .delete(schema.sessions)
    .where(and(eq(schema.sessions.userId, userId), ne(schema.sessions.id, currentId ?? "")));
}

/* ----------------------------- account ----------------------------- */

export async function deleteAccountAction(): Promise<void> {
  const userId = await requireUserIdFromCookie();
  await db.delete(schema.homework).where(eq(schema.homework.userId, userId));
  await db.delete(schema.events).where(eq(schema.events.userId, userId));
  await db.delete(schema.payments).where(eq(schema.payments.userId, userId));
  await db.delete(schema.lessons).where(eq(schema.lessons.userId, userId));
  await db.delete(schema.students).where(eq(schema.students.userId, userId));
  await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
  await db.delete(schema.profiles).where(eq(schema.profiles.id, userId));
  await db.delete(schema.users).where(eq(schema.users.id, userId));
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
