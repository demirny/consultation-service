import type { z } from "zod";

export async function requestJson<T>(url: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  });
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error ?? "Не удалось выполнить запрос.");
  return data as T;
}

export function validated<T>(schema: z.ZodType<T>, value: unknown) {
  const result = schema.safeParse(value);
  if (!result.success) throw new Error(result.error.issues[0].message);
  return result.data;
}
