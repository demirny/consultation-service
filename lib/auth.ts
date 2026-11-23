import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sessionCookie, sessionDuration, signSession, verifySession } from "@/lib/session";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const;

export const currentUser = cache(async () => {
  const jar = await cookies();
  const claims = await verifySession(jar.get(sessionCookie)?.value);
  if (!claims) return null;
  const user = await prisma.user.findUnique({
    where: { id: claims.id },
    select: { id: true, email: true, fullName: true, role: true, groupName: true },
  });
  return user?.role === claims.role ? { ...user, role: claims.role } : null;
});

export async function startSession(user: { id: string; role: string }) {
  const jar = await cookies();
  jar.set(sessionCookie, await signSession(user.id, user.role), { ...cookieOptions, maxAge: sessionDuration });
}

export async function endSession() {
  const jar = await cookies();
  jar.set(sessionCookie, "", { ...cookieOptions, maxAge: 0 });
}
