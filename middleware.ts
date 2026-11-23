import { NextResponse, type NextRequest } from "next/server";
import { sessionCookie, verifySession } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const user = await verifySession(request.cookies.get(sessionCookie)?.value);
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const dashboard = user.role === "TEACHER" ? "/dashboard/teacher" : "/dashboard/student";
  const path = request.nextUrl.pathname;
  if (path !== dashboard && !path.startsWith(`${dashboard}/`)) {
    return NextResponse.redirect(new URL(dashboard, request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/student/:path*", "/dashboard/teacher/:path*"] };
