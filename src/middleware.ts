import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Block /keystatic routes in production
  if (
    process.env.NODE_ENV === "production" &&
    request.nextUrl.pathname.startsWith("/keystatic")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/keystatic/:path*",
};
