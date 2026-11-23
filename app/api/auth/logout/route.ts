import { endpoint } from "@/lib/api";
import { endSession } from "@/lib/auth";

export const POST = endpoint(async () => {
  await endSession();
  return new Response(null, { status: 204 });
});
