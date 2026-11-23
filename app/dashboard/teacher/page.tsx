import { redirect } from "next/navigation";
import TeacherDashboard from "@/components/TeacherDashboard";
import { currentUser } from "@/lib/auth";
import { listBookings } from "@/lib/bookings";
import { listConsultations } from "@/lib/consultations";

export const metadata = { title: "Кабинет преподавателя" };

export default async function TeacherPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "TEACHER") redirect("/dashboard/student");
  const [items, bookings] = await Promise.all([listConsultations({ teacherId: user.id }), listBookings(user)]);

  return (
    <div className="wrap space-y-6 py-9 sm:py-12">
      <header className="space-y-3">
        <h1 className="heading">Кабинет преподавателя</h1>
        <p className="muted">Планируйте встречи и управляйте записями студентов.</p>
      </header>
      <TeacherDashboard items={items.map((item) => ({ ...item, date: item.date.toISOString() }))} bookings={bookings} />
    </div>
  );
}
