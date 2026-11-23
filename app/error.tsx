"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="wrap py-12">
      <section className="panel max-w-xl space-y-4">
        <h1 className="text-3xl font-semibold">Не удалось загрузить страницу</h1>
        <div className="flex flex-wrap gap-2">
          <button className="btn" onClick={reset}>Повторить</button>
          <Link href="/" className="btn secondary">На главную</Link>
        </div>
      </section>
    </div>
  );
}
