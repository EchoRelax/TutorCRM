import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "lumen_session";
const ISSUER = "lumen";
const AUDIENCE = "lumen";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret(): Uint8Array {
  const raw = process.env.AUTH_SECRET;
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET is not set");
    }
    return new TextEncoder().encode("dev-secret-change-me");
  }
  return new TextEncoder().encode(raw);
}

export async function signSession(userId: string, sessionId: string): Promise<string> {
  return new SignJWT({ sid: sessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySession(
  token: string | undefined | null
): Promise<{ userId: string; sessionId: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    const userId = payload.sub;
    const sessionId = payload.sid;
    if (typeof userId !== "string" || typeof sessionId !== "string") return null;
    return { userId, sessionId };
  } catch {
    return null;
  }
}

// Короткоживущий тикет для второго шага 2FA (после проверки пароля).
export async function signTwoFactorTicket(userId: string): Promise<string> {
  return new SignJWT({ step: "2fa" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime("5m")
    .sign(getSecret());
}

export async function verifyTwoFactorTicket(
  token: string | undefined | null
): Promise<{ userId: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (payload.step !== "2fa" || typeof payload.sub !== "string") return null;
    return { userId: payload.sub };
  } catch {
    return null;
  }
}
