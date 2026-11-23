"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="ru">
      <body className="bg-paper text-ink">
        <main className="wrap py-12">
          <section className="panel max-w-xl space-y-4">
            <h1 className="text-3xl font-semibold">Не удалось открыть сервис</h1>
            <button className="btn" onClick={reset}>Повторить</button>
          </section>
        </main>
      </body>
    </html>
  );
}
