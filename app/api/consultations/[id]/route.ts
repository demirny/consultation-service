import type { Prisma } from "@prisma/client";
import { ApiError, endpoint, input, requireUser, writeTransaction } from "@/lib/api";
import { consultationInclude, consultationView } from "@/lib/consultations";
import { consultationPatchSchema } from "@/lib/validations";

type Context = { params: Promise<{ id: string }> };

async function ownedConsultation(db: Prisma.TransactionClient, id: string, teacherId: string) {
  const item = await db.consultation.findUnique({ where: { id }, include: consultationInclude });
  if (!item) throw new ApiError(404, "Консультация не найдена.");
  if (item.teacherId !== teacherId) throw new ApiError(403, "Изменять можно только свои консультации.");
  return item;
}

export const PATCH = endpoint(async (request: Request, { params }: Context) => {
  const teacher = await requireUser("TEACHER");
  const { id } = await params;
  const patch = await input(request, consultationPatchSchema);
  const item = await writeTransaction(async (db) => {
    const current = await ownedConsultation(db, id, teacher.id);
    if ((patch.startTime ?? current.startTime) >= (patch.endTime ?? current.endTime)) {
      throw new ApiError(400, "Время окончания должно быть позже начала.");
    }
    if (patch.maxStudents !== undefined && patch.maxStudents < current._count.bookings) {
      throw new ApiError(409, "Лимит мест меньше числа подтверждённых записей.");
    }
    return db.consultation.update({
      where: { id },
      data: { ...patch, date: patch.date ? new Date(patch.date) : undefined },
      include: consultationInclude,
    });
  });
  return Response.json(consultationView(item));
});

export const DELETE = endpoint(async (_request: Request, { params }: Context) => {
  const teacher = await requireUser("TEACHER");
  const { id } = await params;
  await writeTransaction(async (db) => {
    await ownedConsultation(db, id, teacher.id);
    await db.consultation.delete({ where: { id } });
  });
  return new Response(null, { status: 204 });
});
