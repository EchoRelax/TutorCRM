import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { verifySession, SESSION_COOKIE } from "./auth";

async function resolveSession(): Promise<{ userId: string; sessionId: string } | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (!session) return null;

  // Сессия должна существовать в БД (иначе она отозвана).
  const [row] = await db
    .select({ id: schema.sessions.id })
    .from(schema.sessions)
    .where(
      and(
        eq(schema.sessions.id, session.sessionId),
        eq(schema.sessions.userId, session.userId)
      )
    )
    .limit(1);
  if (!row) return null;

  void db
    .update(schema.sessions)
    .set({ lastSeenAt: new Date() })
    .where(eq(schema.sessions.id, session.sessionId));

  return session;
}

export async function getUserId(): Promise<string | null> {
  return (await resolveSession())?.userId ?? null;
}

export async function requireUserId(): Promise<string> {
  const userId = await getUserId();
  if (!userId) throw new Error("Необходима авторизация");
  return userId;
}

export async function getCurrentSessionId(): Promise<string | null> {
  return (await resolveSession())?.sessionId ?? null;
}
