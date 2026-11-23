"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { loginSchema, registerSchema } from "@/lib/validations";
import { requestJson, validated } from "@/lib/client-api";
import { useRequest } from "./useRequest";

export default function AuthForm({ register = false }: { register?: boolean }) {
  const [role, setRole] = useState("STUDENT");
  const { busy, error, run } = useRequest();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    void run(async () => {
      const body = validated(register ? registerSchema : loginSchema, fields);
      const { user } = await requestJson<{ user: { role: string } }>(`/api/auth/${register ? "register" : "login"}`, "POST", body);
      window.location.assign(user.role === "TEACHER" ? "/dashboard/teacher" : "/dashboard/student");
    });
  }

  return (
    <section className="wrap py-10 sm:py-16">
      <div className="panel mx-auto max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight">{register ? "Создать аккаунт" : "Вход в аккаунт"}</h1>
        <form className="mt-6" onSubmit={submit}>
          <fieldset className="grid gap-4" disabled={busy}>
            {register && <label className="field">Имя и фамилия<input className="control" name="fullName" autoComplete="name" required /></label>}
            <label className="field">Электронная почта<input className="control" name="email" type="email" autoComplete="email" required /></label>
            <label className="field">Пароль<input className="control" name="password" type="password" autoComplete={register ? "new-password" : "current-password"} required minLength={6} /></label>
            {register && <>
              <label className="field">Роль
                <select className="control" name="role" value={role} onChange={(event) => setRole(event.target.value)}>
                  <option value="STUDENT">Студент</option>
                  <option value="TEACHER">Преподаватель</option>
                </select>
              </label>
              {role === "STUDENT" && <label className="field">Группа (необязательно)<input className="control" name="groupName" /></label>}
            </>}
            {error && <p role="alert" className="problem">{error}</p>}
            <button className="btn mt-2">{busy ? "Отправляем…" : register ? "Зарегистрироваться" : "Войти"}</button>
          </fieldset>
        </form>
        <p className="mt-5 text-sm muted">
          {register ? "Уже есть аккаунт?" : "Впервые здесь?"}{" "}
          <Link className="font-semibold underline" href={register ? "/login" : "/register"}>{register ? "Войти" : "Создать аккаунт"}</Link>
        </p>
      </div>
    </section>
  );
}
