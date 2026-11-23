import { consultationInclude, consultationView } from "@/lib/consultations";
import { prisma } from "@/lib/prisma";

export async function listBookings(user: { id: string; role: "STUDENT" | "TEACHER" }) {
  const items = await prisma.booking.findMany({
    where: user.role === "STUDENT" ? { studentId: user.id } : { consultation: { teacherId: user.id } },
    include: {
      consultation: { include: consultationInclude },
      student: { select: { id: true, fullName: true, groupName: true } },
    },
    orderBy: [{ consultation: { date: "asc" } }, { consultation: { startTime: "asc" } }, { id: "asc" }],
  });
  return items.map((item) => ({ ...item, consultation: consultationView(item.consultation) }));
}

export type BookingItem = Awaited<ReturnType<typeof listBookings>>[number];
