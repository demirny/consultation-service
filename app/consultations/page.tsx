import Catalog from "@/components/Catalog";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Расписание" };

export default async function ConsultationsPage() {
  const user = await currentUser();
  const bookings = user?.role === "STUDENT" ? await prisma.booking.findMany({
    where: { studentId: user.id, status: "CONFIRMED" },
    select: { consultationId: true },
  }) : [];

  return (
    <div className="wrap space-y-6 py-9 sm:py-12">
      <header className="space-y-3">
        <h1 className="heading">Расписание консультаций</h1>
        <p className="muted">Выберите предмет и преподавателя, чтобы найти подходящую встречу.</p>
      </header>
      <Catalog role={user?.role} confirmed={bookings.map(({ consultationId }) => consultationId)} />
    </div>
  );
}
