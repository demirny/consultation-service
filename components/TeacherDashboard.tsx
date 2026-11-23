"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { BookingItem } from "@/lib/bookings";
import { requestJson, validated } from "@/lib/client-api";
import { bookingStatusSchema, consultationSchema } from "@/lib/validations";
import ConsultationCard, { type ConsultationItem } from "./ConsultationCard";
import { useRequest } from "./useRequest";

const fields = [
  { title: "Название", name: "title", type: "text" },
  { title: "Предмет", name: "subject", type: "text" },
  { title: "Дата", name: "date", type: "date" },
  { title: "Место встречи", name: "location", type: "text" },
  { title: "Начало", name: "startTime", type: "time" },
  { title: "Окончание", name: "endTime", type: "time" },
  { title: "Количество мест", name: "maxStudents", type: "number" },
] as const;

export default function TeacherDashboard({ items, bookings }: { items: ConsultationItem[]; bookings: BookingItem[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<ConsultationItem | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [notice, setNotice] = useState("");
  const { busy, error, run } = useRequest();

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    action(async () => {
      const data = validated(consultationSchema, { ...values, maxStudents: Number(values.maxStudents) });
      await requestJson(editing ? `/api/consultations/${editing.id}` : "/api/consultations", editing ? "PATCH" : "POST", data);
      setEditing(null);
      setFormKey((key) => key + 1);
    }, "Консультация сохранена.");
  }

  function action(operation: () => Promise<void>, message: string) {
    setNotice("");
    void run(async () => {
      await operation();
      setNotice(message);
      router.refresh();
    });
  }

  function remove(item: ConsultationItem) {
    if (!window.confirm(`Удалить «${item.title}» вместе со всеми записями?`)) return;
    action(async () => {
      await requestJson(`/api/consultations/${item.id}`, "DELETE");
      if (editing?.id === item.id) setEditing(null);
    }, "Консультация удалена.");
  }

  return (
    <div className="space-y-6">
      {error && <p role="alert" className="problem">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-moss p-3">{notice}</p>}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="panel" aria-labelledby="editor-heading">
          <h2 id="editor-heading" className="text-xl font-bold">{editing ? "Редактировать консультацию" : "Новая консультация"}</h2>
          <form key={editing?.id ?? formKey} className="mt-5" onSubmit={save}>
            <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
              {fields.map(({ title, name, type }) => (
                <label key={name} className="field">{title}
                  <input name={name} type={type} className="control" required
                    defaultValue={name === "date" ? editing?.date.slice(0, 10) : editing?.[name]}
                    {...(type === "number" ? { min: 1, max: 100 } : {})} />
                </label>
              ))}
              <label className="field sm:col-span-2">Описание
                <textarea name="description" className="control" rows={4} required defaultValue={editing?.description} />
              </label>
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <button className="btn">{busy ? "Обновляем…" : "Сохранить"}</button>
                {editing && <button type="button" className="btn secondary" onClick={() => setEditing(null)}>Закрыть редактор</button>}
              </div>
            </fieldset>
          </form>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Мои консультации</h2>
          {!items.length && <p className="panel muted">Создайте первую консультацию с помощью формы.</p>}
          {items.map((item) => {
            const students = bookings.filter((booking) => booking.consultationId === item.id);
            return (
              <ConsultationCard key={item.id} item={item}>
                <div className="flex flex-wrap gap-2">
                  <button className="btn secondary" disabled={busy} onClick={() => {
                    setEditing(item);
                    document.getElementById("editor-heading")?.scrollIntoView({ block: "center" });
                  }}>Редактировать</button>
                  <button className="btn secondary !text-red-800" disabled={busy} onClick={() => remove(item)}>Удалить</button>
                </div>
                <details className="rounded-xl bg-paper p-3">
                  <summary className="cursor-pointer text-sm font-semibold">Записи студентов ({students.length})</summary>
                  {students.length === 0 && <p className="pt-3 text-sm muted">Записей пока нет.</p>}
                  <ul className="mt-2 divide-y divide-emerald-950/10">
                    {students.map(({ id, student, status }) => {
                      const confirmed = status === "CONFIRMED";
                      return (
                        <li key={id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                          <div>
                            <p className="font-semibold">{student.fullName}{student.groupName && ` · ${student.groupName}`}</p>
                            <p className="muted">{confirmed ? "Подтверждена" : "Отменена"}</p>
                          </div>
                          <button className="btn secondary" disabled={busy || (!confirmed && !item.available)} onClick={() =>
                            action(async () => {
                              await requestJson(`/api/bookings/${id}`, "PATCH", validated(bookingStatusSchema, { status: confirmed ? "CANCELLED" : "CONFIRMED" }));
                            }, "Статус записи обновлён.")
                          }>{confirmed ? "Отменить" : "Подтвердить"}</button>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              </ConsultationCard>
            );
          })}
        </section>
      </div>
    </div>
  );
}
