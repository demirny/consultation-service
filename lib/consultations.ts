import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const consultationInclude = {
  teacher: { select: { id: true, fullName: true } },
  _count: { select: { bookings: { where: { status: "CONFIRMED" } } } },
} satisfies Prisma.ConsultationInclude;

export function consultationView({ _count, ...consultation }: Prisma.ConsultationGetPayload<{ include: typeof consultationInclude }>) {
  return { ...consultation, available: Math.max(0, consultation.maxStudents - _count.bookings) };
}

export async function listConsultations(where: Prisma.ConsultationWhereInput = {}) {
  const consultations = await prisma.consultation.findMany({
    where,
    include: consultationInclude,
    orderBy: [{ date: "asc" }, { startTime: "asc" }, { id: "asc" }],
  });
  return consultations.map(consultationView);
}
