import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // This project uses cookie-based locale detection (no URL prefix).
  // next-intl createMiddleware is NOT used here — it would redirect / → /en causing 404.
  // All locale resolution happens in src/i18n/request.ts via the "locale" cookie.
  // This middleware intentionally does nothing and lets all requests pass through.
  return NextResponse.next();
}

export const config = {
  // Only run on page routes — skip API, _next internals, and static files
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};