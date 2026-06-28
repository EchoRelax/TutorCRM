import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "./auth";

export async function getUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  return session?.userId ?? null;
}

export async function requireUserId(): Promise<string> {
  const userId = await getUserId();
  if (!userId) throw new Error("Необходима авторизация");
  return userId;
}
