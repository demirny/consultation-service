import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap py-12">
      <section className="panel max-w-xl space-y-4">
        <h1 className="text-3xl font-semibold">Страница не найдена</h1>
        <p className="muted">Проверьте адрес или откройте расписание консультаций.</p>
        <Link href="/consultations" className="btn">Открыть расписание</Link>
      </section>
    </div>
  );
}
