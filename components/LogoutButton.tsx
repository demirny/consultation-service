"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function logout() {
    setBusy(true);
    setError("");
    try {
      const result = await fetch("/api/auth/logout", { method: "POST" });
      if (!result.ok) throw new Error();
      window.location.assign("/");
    } catch {
      setError("Не удалось выйти. Повторите попытку.");
      setBusy(false);
    }
  }

  return (
    <div>
      <button type="button" className="btn secondary" onClick={logout} disabled={busy}>{busy ? "Выходим…" : "Выйти"}</button>
      {error && <p role="alert" className="mt-1 text-red-800">{error}</p>}
    </div>
  );
}
