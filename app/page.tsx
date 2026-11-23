import Link from "next/link";
import { BookOpen, CalendarDays, ClipboardList, GraduationCap } from "lucide-react";

const steps = [
  { icon: CalendarDays, title: "Выберите консультацию", text: "Найдите нужный предмет или преподавателя в расписании." },
  { icon: ClipboardList, title: "Забронируйте место", text: "Войдите в аккаунт студента и запишитесь на удобное время." },
  { icon: BookOpen, title: "Загляните в кабинет", text: "Проверьте время, аудиторию и статус своей записи." },
];

export default function Home() {
  return (
    <div className="wrap space-y-12 py-8 sm:py-12">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-pine px-6 py-12 text-white sm:px-12 sm:py-20">
        <GraduationCap aria-hidden strokeWidth={0.65} className="pointer-events-none absolute -bottom-20 -right-12 -z-10 size-[28rem] -rotate-12 text-moss/15 sm:right-0" />
        <div className="max-w-2xl">
          <span className="pill">Учебный сервис</span>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.06] tracking-tight sm:text-6xl">Консультации для студентов и преподавателей</h1>
          <p className="mt-5 max-w-lg text-lg text-emerald-50/85">Найдите время для вопросов по учёбе. Записывайтесь на встречи и управляйте расписанием в личном кабинете.</p>
          <Link href="/consultations" className="btn mt-8 bg-moss text-pine hover:bg-lime-100">Открыть расписание</Link>
        </div>
      </section>
      <section>
        <h2 className="mb-5 text-2xl font-bold">Как записаться</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }) => (
            <article className="panel" key={title}>
              <Icon aria-hidden className="mb-4 text-pine" />
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="mt-2 muted">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
