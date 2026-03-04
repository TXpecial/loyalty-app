import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith("/customer") || pathname.startsWith("/owner");

  if (!isProtected) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("loyalty_session")?.value;

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/customer/:path*", "/owner/:path*"],
};

