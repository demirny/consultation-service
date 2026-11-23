import { compare } from "bcryptjs";
import { ApiError, endpoint, input } from "@/lib/api";
import { startSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";

const dummyHash = "$2b$12$C6UzMDM.H6dfI/f/IKcEe.7TyRUcAHSX1cgUVSgK4o7QA9UlYY4kq";

export const POST = endpoint(async (request: Request) => {
  const { email, password } = await input(request, loginSchema);
  const account = await prisma.user.findUnique({ where: { email } });
  const valid = await compare(password, account?.passwordHash ?? dummyHash);
  if (!account || !valid) throw new ApiError(401, "Неверная почта или пароль.");
  const { id, fullName, role } = account;
  await startSession({ id, role });
  return Response.json({ user: { id, fullName, role } });
});
