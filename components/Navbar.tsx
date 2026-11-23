import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { currentUser } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const user = await currentUser();
  return (
    <header className="border-b border-emerald-950/10 bg-white">
      <nav aria-label="Главное меню" className="wrap flex min-h-20 flex-wrap items-center justify-between gap-3 py-3">
        <Link href="/" className="flex items-center gap-3 font-bold">
          <span className="rounded-xl bg-pine p-2.5 text-moss"><GraduationCap aria-hidden size={23} /></span>
          Консультации
        </Link>
        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold sm:gap-6">
          <Link href="/consultations" className="hover:underline">Расписание</Link>
          {user ? <>
            <Link className="hover:underline" href={user.role === "TEACHER" ? "/dashboard/teacher" : "/dashboard/student"}>Личный кабинет</Link>
            <span className="muted">{user.fullName}</span>
            <LogoutButton />
          </> : <Link href="/login" className="btn secondary">Войти</Link>}
        </div>
      </nav>
    </header>
  );
}
