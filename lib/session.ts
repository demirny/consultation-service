import { SignJWT, jwtVerify } from "jose";
import { roles } from "@/lib/validations";

export const sessionCookie = "college_session";
export const sessionDuration = 60 * 60 * 24 * 7;

function signingKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is required");
  return new TextEncoder().encode(secret);
}

export async function signSession(id: string, role: string) {
  return new SignJWT({ role: roles.parse(role) })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(id)
    .setIssuedAt()
    .setExpirationTime(`${sessionDuration}s`)
    .sign(signingKey());
}

export async function verifySession(token?: string) {
  if (!token) return null;
  const key = signingKey();
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"], requiredClaims: ["sub", "exp"] });
    const role = roles.safeParse(payload.role);
    return payload.sub && role.success ? { id: payload.sub, role: role.data } : null;
  } catch {
    return null;
  }
}
