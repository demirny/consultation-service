import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-emerald-950/10">
      <div className="wrap flex flex-wrap items-center justify-between gap-3 py-6 text-sm muted">
        <span>Консультации · Учебный сервис</span>
        <Link href="/consultations" className="hover:underline">Расписание консультаций</Link>
      </div>
    </footer>
  );
}
