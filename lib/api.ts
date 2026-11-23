import { Prisma } from "@prisma/client";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { roles } from "@/lib/validations";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function endpoint<Args extends unknown[]>(handler: (...args: Args) => Promise<Response>) {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ApiError) return Response.json({ error: error.message }, { status: error.status });
      if (error instanceof z.ZodError) return Response.json({ error: error.issues[0].message, issues: error.flatten().fieldErrors }, { status: 400 });
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") return Response.json({ error: "Такая запись уже существует." }, { status: 409 });
        if (error.code === "P2025") return Response.json({ error: "Запись не найдена." }, { status: 404 });
        if (isContention(error)) return Response.json({ error: "Данные обновляются. Повторите запрос." }, { status: 503 });
      }
      console.error(error);
      return Response.json({ error: "Не удалось выполнить запрос." }, { status: 500 });
    }
  };
}

export async function input<T>(request: Request, schema: z.ZodType<T>) {
  const data = await request.json().catch(() => { throw new ApiError(400, "Ожидается корректный JSON."); });
  return schema.parse(data);
}

export async function requireUser(role?: z.infer<typeof roles>) {
  const user = await currentUser();
  if (!user) throw new ApiError(401, "Войдите в аккаунт.");
  if (role && user.role !== role) throw new ApiError(403, "У вашей роли нет доступа к этому действию.");
  return user;
}

function isContention(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && ["P1008", "P2028", "P2034"].includes(error.code);
}

export async function writeTransaction<T>(write: (db: Prisma.TransactionClient) => Promise<T>) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await prisma.$transaction(write);
    } catch (error) {
      if (attempt >= 2 || !isContention(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
    }
  }
}
