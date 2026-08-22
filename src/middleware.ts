import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdminSessionValue } from "@/lib/admin-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const valid = await isAdminSessionValue(
    request.cookies.get(ADMIN_COOKIE)?.value,
  );
  if (valid) {
    return NextResponse.next();
  }

  const login = new URL("/admin/login", request.url);
  login.searchParams.set("from", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*"],
};
