import { endpoint, input, requireUser } from "@/lib/api";
import { consultationInclude, consultationView, listConsultations } from "@/lib/consultations";
import { prisma } from "@/lib/prisma";
import { consultationSchema } from "@/lib/validations";

export const GET = endpoint(async (request: Request) => {
  const query = new URL(request.url).searchParams;
  const [items, subjects, teachers] = await Promise.all([
    listConsultations({ teacherId: query.get("teacherId") || undefined, subject: query.get("subject") || undefined }),
    prisma.consultation.findMany({ distinct: ["subject"], select: { subject: true }, orderBy: { subject: "asc" } }),
    prisma.user.findMany({ where: { role: "TEACHER", consultations: { some: {} } }, select: { id: true, fullName: true }, orderBy: { fullName: "asc" } }),
  ]);
  return Response.json({ items, subjects: subjects.map(({ subject }) => subject), teachers });
});

export const POST = endpoint(async (request: Request) => {
  const user = await requireUser("TEACHER");
  const data = await input(request, consultationSchema);
  const item = await prisma.consultation.create({
    data: { ...data, date: new Date(data.date), teacherId: user.id },
    include: consultationInclude,
  });
  return Response.json(consultationView(item), { status: 201 });
});
