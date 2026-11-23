"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BookingItem } from "@/lib/bookings";
import { requestJson } from "@/lib/client-api";
import ConsultationCard from "./ConsultationCard";
import { useRequest } from "./useRequest";

export default function StudentDashboard({ bookings }: { bookings: BookingItem[] }) {
  const router = useRouter();
  const { busy, error, run } = useRequest();

  function cancel(id: string) {
    void run(async () => {
      await requestJson(`/api/bookings/${id}`, "DELETE");
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {error && <p role="alert" className="problem">{error}</p>}
      {!bookings.length && <div className="panel">
        <p className="mb-4 muted">У вас пока нет записей на консультации.</p>
        <Link href="/consultations" className="btn">Открыть расписание</Link>
      </div>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bookings.map(({ id, consultation, status }) => (
          <ConsultationCard key={id} item={{ ...consultation, date: consultation.date.toISOString() }}>
            <p className="text-sm font-semibold">{status === "CONFIRMED" ? "Запись подтверждена" : "Запись отменена"}</p>
            {status === "CONFIRMED" && <button className="btn secondary" disabled={busy} onClick={() => cancel(id)}>
              {busy ? "Обновляем…" : "Отменить запись"}
            </button>}
          </ConsultationCard>
        ))}
      </div>
    </div>
  );
}
