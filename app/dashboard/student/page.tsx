import { redirect } from "next/navigation";
import StudentDashboard from "@/components/StudentDashboard";
import { currentUser } from "@/lib/auth";
import { listBookings } from "@/lib/bookings";

export const metadata = { title: "Кабинет студента" };

export default async function StudentPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "STUDENT") redirect("/dashboard/teacher");
  return (
    <div className="wrap space-y-6 py-9 sm:py-12">
      <header className="space-y-3">
        <h1 className="heading">Мои записи</h1>
        <p className="muted">Консультации и статусы ваших записей.</p>
      </header>
      <StudentDashboard bookings={await listBookings(user)} />
    </div>
  );
}
