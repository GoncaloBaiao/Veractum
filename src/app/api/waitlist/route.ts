import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient, DATABASE_UNAVAILABLE_MESSAGE, isDatabaseUnavailableError } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const prisma = getPrismaClient();
  if (!prisma) {
    return NextResponse.json({ success: false, error: DATABASE_UNAVAILABLE_MESSAGE }, { status: 503 });
  }

  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: "Valid email required." }, { status: 400 });
    }

    await prisma.extensionWaitlist.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json({ success: false, error: DATABASE_UNAVAILABLE_MESSAGE }, { status: 503 });
    }
    return NextResponse.json({ success: false, error: "Failed to join waitlist." }, { status: 500 });
  }
}
