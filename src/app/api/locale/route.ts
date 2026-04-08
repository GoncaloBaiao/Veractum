import { NextRequest, NextResponse } from "next/server";

const VALID_LOCALES = new Set(["en", "pt", "es", "fr", "de", "it", "zh", "ja", "ru"]);

export async function POST(request: NextRequest) {
  const body = await request.json();
  const locale = body?.locale;

  if (typeof locale !== "string" || !VALID_LOCALES.has(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const response = NextResponse.json({ locale });
  response.cookies.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });

  return response;
}
