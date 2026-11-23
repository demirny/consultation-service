import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { ApiError, endpoint, input } from "@/lib/api";
import { startSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export const POST = endpoint(async (request: Request) => {
  const { password, groupName, ...data } = await input(request, registerSchema);
  const passwordHash = await hash(password, 12);
  const user = await prisma.user.create({
    data: { ...data, passwordHash, groupName: data.role === "STUDENT" ? groupName || null : null },
    select: { id: true, fullName: true, role: true },
  }).catch((error: unknown) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ApiError(409, "Аккаунт с такой почтой уже существует.");
    }
    throw error;
  });
  await startSession(user);
  return Response.json({ user }, { status: 201 });
});
