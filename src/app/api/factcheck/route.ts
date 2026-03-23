import { NextRequest, NextResponse } from "next/server";
import { factCheckClaims } from "@/lib/factcheck";
import type { ApiResponse, Claim, FactCheckedClaim } from "@/types";

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<FactCheckedClaim[]>>> {
  try {
    const body = await request.json();
    const claims: unknown = body?.claims;

    if (!Array.isArray(claims) || claims.length === 0) {
      return NextResponse.json(
        { success: false, error: "An array of claims is required." },
        { status: 400 }
      );
    }

    // Validate claim structure
    const validClaims: Claim[] = [];
    for (const claim of claims) {
      if (
        typeof claim !== "object" ||
        claim === null ||
        typeof (claim as Record<string, unknown>).text !== "string" ||
        typeof (claim as Record<string, unknown>).type !== "string"
      ) {
        return NextResponse.json(
          { success: false, error: "Each claim must have a text and type field." },
          { status: 400 }
        );
      }

      const c = claim as Record<string, unknown>;
      validClaims.push({
        id: (c.id as string) ?? `claim-${validClaims.length}`,
        text: c.text as string,
        type: c.type as Claim["type"],
        timestamp: (c.timestamp as string) ?? undefined,
        confidence: typeof c.confidence === "number" ? c.confidence : 50,
      });
    }

    if (validClaims.length > 15) {
      return NextResponse.json(
        { success: false, error: "Maximum 15 claims per request." },
        { status: 400 }
      );
    }

    const factChecked = await factCheckClaims(validClaims);

    return NextResponse.json({
      success: true,
      data: factChecked,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Fact-checking failed. Please try again." },
      { status: 500 }
    );
  }
}
