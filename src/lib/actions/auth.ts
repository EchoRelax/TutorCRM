"use server";

import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, schema } from "@/db/client";
import { signSession, verifySession, SESSION_COOKIE } from "@/lib/auth";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
}

const MAX_AGE = 60 * 60 * 24 * 30;

async function setSession(userId: string) {
  const token = await signSession(userId);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

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

  await setSession(user.id);
  return { id: user.id, email: user.email, full_name: user.fullName };
}

export async function loginAction(email: string, password: string): Promise<AuthUser> {
  const normalized = email.trim().toLowerCase();
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, normalized))
    .limit(1);
  if (!user) throw new Error("Неверный email или пароль.");
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("Неверный email или пароль.");

  await setSession(user.id);
  return { id: user.id, email: user.email, full_name: user.fullName };
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUserAction(): Promise<AuthUser | null> {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, session.userId))
    .limit(1);
  if (!user) return null;
  return { id: user.id, email: user.email, full_name: user.fullName };
}
