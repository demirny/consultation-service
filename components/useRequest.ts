"use client";

import { useState } from "react";

export function useRequest() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось выполнить действие.");
    } finally {
      setBusy(false);
    }
  }

  return { busy, error, run };
}
