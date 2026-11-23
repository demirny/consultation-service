import { ApiError, endpoint, input, requireUser, writeTransaction } from "@/lib/api";
import { consultationInclude } from "@/lib/consultations";
import { bookingStatusSchema } from "@/lib/validations";

type Context = { params: Promise<{ id: string }> };

async function changeStatus({ params }: Context, status: "CONFIRMED" | "CANCELLED", cancellationOnly = false) {
  const user = await requireUser();
  const { id } = await params;
  return writeTransaction(async (db) => {
    const booking = await db.booking.findUnique({
      where: { id },
      include: { consultation: { include: consultationInclude } },
    });
    if (!booking) throw new ApiError(404, "Запись не найдена.");
    const allowed = user.role === "STUDENT"
      ? booking.studentId === user.id && status === "CANCELLED"
      : booking.consultation.teacherId === user.id && !cancellationOnly;
    if (!allowed) throw new ApiError(403, "У вас нет доступа к изменению этой записи.");
    if (status === "CONFIRMED" && booking.status !== status &&
        booking.consultation._count.bookings >= booking.consultation.maxStudents) {
      throw new ApiError(409, "Свободных мест нет.");
    }
    return db.booking.update({ where: { id }, data: { status } });
  });
}

export const PATCH = endpoint(async (request: Request, context: Context) => {
  const { status } = await input(request, bookingStatusSchema);
  return Response.json(await changeStatus(context, status));
});

export const DELETE = endpoint(async (_request: Request, context: Context) => {
  await changeStatus(context, "CANCELLED", true);
  return new Response(null, { status: 204 });
});
