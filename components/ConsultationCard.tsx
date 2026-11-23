import { CalendarDays, Clock, MapPin, UserRound } from "lucide-react";

export type ConsultationItem = {
  id: string;
  title: string;
  description: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  maxStudents: number;
  available: number;
  teacher: { id: string; fullName: string };
};

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(date));
}

export default function ConsultationCard({ item, children }: { item: ConsultationItem; children?: React.ReactNode }) {
  return (
    <article className="panel flex min-w-0 flex-col gap-4">
      <span className="pill">{item.subject}</span>
      <h2 className="break-words text-xl font-bold">{item.title}</h2>
      <p className="break-words muted">{item.description}</p>
      <ul className="mt-auto space-y-2 text-sm muted">
        <li className="flex items-center gap-2"><CalendarDays size={16} aria-hidden />{formatDate(item.date)}</li>
        <li className="flex items-center gap-2"><Clock size={16} aria-hidden />{item.startTime}–{item.endTime}</li>
        <li className="flex items-center gap-2"><MapPin size={16} aria-hidden />{item.location}</li>
        <li className="flex items-center gap-2"><UserRound size={16} aria-hidden />{item.teacher.fullName}</li>
      </ul>
      <div className="grid gap-3 border-t border-emerald-950/10 pt-4">
        <p className="text-sm font-semibold">{item.available ? `Свободно ${item.available} из ${item.maxStudents}` : "Свободных мест нет"}</p>
        {children}
      </div>
    </article>
  );
}
