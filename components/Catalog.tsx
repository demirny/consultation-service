"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ConsultationCard, { type ConsultationItem } from "./ConsultationCard";
import { requestJson, validated } from "@/lib/client-api";
import { bookingSchema } from "@/lib/validations";
import { useRequest } from "./useRequest";

type CatalogData = { items: ConsultationItem[]; subjects: string[]; teachers: ConsultationItem["teacher"][] };

export default function Catalog({ role, confirmed }: { role?: string; confirmed: string[] }) {
  const [filters, setFilters] = useState({ subject: "", teacherId: "" });
  const [data, setData] = useState<CatalogData>();
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const [booked, setBooked] = useState(confirmed);
  const [notice, setNotice] = useState("");
  const { busy, error, run } = useRequest();

  useEffect(() => {
    let current = true;
    const query = new URLSearchParams(filters);
    requestJson<CatalogData>(`/api/consultations?${query}`).then((result) => {
      if (current) setData(result);
    }).catch((error: Error) => {
      if (current) setLoadError(error.message);
    }).finally(() => {
      if (current) setLoading(false);
    });
    return () => { current = false; };
  }, [filters, version]);

  function refresh() {
    setLoadError("");
    setLoading(true);
    setVersion((value) => value + 1);
  }

  function filter(name: keyof typeof filters, value: string) {
    setLoadError("");
    setLoading(true);
    setFilters((previous) => ({ ...previous, [name]: value }));
  }

  function book(item: ConsultationItem) {
    setNotice("");
    void run(async () => {
      await requestJson("/api/bookings", "POST", validated(bookingSchema, { consultationId: item.id }));
      setBooked((previous) => [...previous, item.id]);
      setNotice(`Вы записаны на «${item.title}».`);
      refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="panel grid gap-4 sm:grid-cols-2">
        <label className="field">Предмет
          <select className="control" value={filters.subject} onChange={(event) => filter("subject", event.target.value)}>
            <option value="">Все предметы</option>
            {data?.subjects.map((subject) => <option key={subject}>{subject}</option>)}
          </select>
        </label>
        <label className="field">Преподаватель
          <select className="control" value={filters.teacherId} onChange={(event) => filter("teacherId", event.target.value)}>
            <option value="">Все преподаватели</option>
            {data?.teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>)}
          </select>
        </label>
      </div>
      {error && <p role="alert" className="problem">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-moss p-3">{notice}</p>}
      {loading && <p role="status" className="muted">Загружаем расписание…</p>}
      {loadError && <div className="problem"><p role="alert">{loadError}</p><button className="mt-2 underline" onClick={refresh}>Обновить</button></div>}
      {!loading && !loadError && !data?.items.length && <p className="panel">По выбранным фильтрам консультаций нет.</p>}
      {!loading && !loadError && <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.items.map((item) => (
          <ConsultationCard key={item.id} item={item}>
            {role === "STUDENT" && <button className="btn" disabled={busy || item.available === 0 || booked.includes(item.id)} onClick={() => book(item)}>
              {booked.includes(item.id) ? "Вы записаны" : item.available ? "Записаться" : "Мест нет"}
            </button>}
            {!role && <Link className="btn secondary" href="/login">Войти для записи</Link>}
          </ConsultationCard>
        ))}
      </div>}
    </div>
  );
}
