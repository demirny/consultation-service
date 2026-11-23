import { ApiError, endpoint, input, requireUser, writeTransaction } from "@/lib/api";
import { consultationInclude, consultationView } from "@/lib/consultations";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validations";

export const GET = endpoint(async () => {
  const user = await requireUser();
  const items = await prisma.booking.findMany({
    where: user.role === "STUDENT" ? { studentId: user.id } : { consultation: { teacherId: user.id } },
    include: {
      consultation: { include: consultationInclude },
      student: { select: { id: true, fullName: true, groupName: true } },
    },
    orderBy: [{ consultation: { date: "asc" } }, { consultation: { startTime: "asc" } }, { id: "asc" }],
  });
  return Response.json({ items: items.map((item) => ({ ...item, consultation: consultationView(item.consultation) })) });
});

export const POST = endpoint(async (request: Request) => {
  const student = await requireUser("STUDENT");
  const { consultationId } = await input(request, bookingSchema);
  const booking = await writeTransaction(async (db) => {
    const consultation = await db.consultation.findUnique({ where: { id: consultationId }, include: consultationInclude });
    if (!consultation) throw new ApiError(404, "Консультация не найдена.");
    const key = { consultationId, studentId: student.id };
    const existing = await db.booking.findUnique({ where: { consultationId_studentId: key } });
    if (existing?.status === "CONFIRMED") throw new ApiError(409, "Вы уже записаны на эту консультацию.");
    if (consultation._count.bookings >= consultation.maxStudents) throw new ApiError(409, "Свободных мест нет.");
    return db.booking.upsert({
      where: { consultationId_studentId: key },
      update: { status: "CONFIRMED" },
      create: key,
    });
  });
  return Response.json(booking, { status: 201 });
});
