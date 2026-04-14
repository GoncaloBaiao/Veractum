import { NextRequest, NextResponse } from "next/server";
import {
  getPrismaClient,
  DATABASE_UNAVAILABLE_MESSAGE,
  isDatabaseUnavailableError,
} from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getTierConfig, parseDurationToSeconds } from "@/lib/tiers";
import { extractYouTubeId } from "@/lib/utils";
import { getVideoMetadata } from "@/lib/youtube";
import { fetchTranscript } from "@/lib/transcription";
import { generateSummary, extractClaims } from "@/lib/ai";
import { factCheckClaims } from "@/lib/factcheck";
import type { ApiResponse, AnalyzeResponse, Analysis, AnalysisListItem, FactCheckedClaim, Summary } from "@/types";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<AnalyzeResponse>>> {
  const prisma = getPrismaClient();
  if (!prisma) {
    return NextResponse.json(
      { success: false, error: DATABASE_UNAVAILABLE_MESSAGE },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const url: unknown = body?.url;
    const locale: string = typeof body?.locale === "string" ? body.locale : "en";

    // Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userTier = (session.user as { tier?: string }).tier ?? "free";
    const tierConfig = getTierConfig(userTier);

    // Language restriction for free tier
    const effectiveLocale = tierConfig.allLanguages ? locale : "en";

    if (typeof url !== "string" || !url.trim()) {
      return NextResponse.json(
        { success: false, error: "A YouTube URL is required." },
        { status: 400 }
      );
    }

    const videoId = extractYouTubeId(url.trim());
    if (!videoId) {
      return NextResponse.json(
        { success: false, error: "Invalid YouTube URL." },
        { status: 400 }
      );
    }

    // Fetch video metadata
    let metadata;
    try {
      metadata = await getVideoMetadata(videoId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch video metadata.";
      return NextResponse.json(
        { success: false, error: message },
        { status: 422 }
      );
    }

    // Check video duration limit
    const durationSeconds = parseDurationToSeconds(metadata.duration);
    if (durationSeconds > tierConfig.maxDurationSeconds) {
      return NextResponse.json(
        { success: false, error: `Video too long for your plan. Max ${Math.floor(tierConfig.maxDurationSeconds / 60)} minutes.` },
        { status: 403 }
      );
    }

    // Check monthly usage quota
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const quota = await prisma.usageQuota.findUnique({
      where: { userId_month: { userId, month: currentMonth } },
    });
    const currentCount = quota?.analysisCount ?? 0;
    if (tierConfig.maxAnalysesPerMonth !== Infinity && currentCount >= tierConfig.maxAnalysesPerMonth) {
      return NextResponse.json(
        { success: false, error: `Monthly analysis limit reached (${tierConfig.maxAnalysesPerMonth}). Upgrade for more.` },
        { status: 403 }
      );
    }

    // Create analysis record
    const analysis = await prisma.analysis.create({
      data: {
        videoId,
        userId,
        videoTitle: metadata.title,
        videoUrl: url.trim(),
        channelTitle: metadata.channelTitle,
        thumbnailUrl: metadata.thumbnailUrl,
        duration: metadata.duration,
        publishedAt: metadata.publishedAt ? new Date(metadata.publishedAt) : null,
        status: "PROCESSING",
      },
    });

    // Validate transcript before background processing so user gets immediate 422 feedback.
    let transcript: string;
    try {
      const transcriptResult = await fetchTranscript(videoId);
      transcript = transcriptResult.transcript;
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Failed to fetch transcript for this video. Please try another video with subtitles enabled."
      );

      await prisma.analysis.update({
        where: { id: analysis.id },
        data: {
          status: "FAILED",
          summary: { error: message },
        },
      });

      return NextResponse.json(
        { success: false, error: message },
        { status: 422 }
      );
    }

    // Process in background (non-blocking)
    processAnalysis(analysis.id, transcript, metadata.title, effectiveLocale, tierConfig.maxClaims).catch(console.error);

    // Increment usage quota
    await prisma.usageQuota.upsert({
      where: { userId_month: { userId, month: currentMonth } },
      update: { analysisCount: { increment: 1 } },
      create: { userId, month: currentMonth, analysisCount: 1 },
    });

    return NextResponse.json(
      {
        success: true,
        data: { analysisId: analysis.id, status: "PROCESSING" },
      },
      { status: 202 }
    );
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json(
        { success: false, error: DATABASE_UNAVAILABLE_MESSAGE },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const prisma = getPrismaClient();
  if (!prisma) {
    return NextResponse.json(
      { success: false, error: DATABASE_UNAVAILABLE_MESSAGE },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);

  // History mode
  if (searchParams.get("history") === "true") {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const userTier = (session.user as { tier?: string }).tier ?? "free";
    const tierConfig = getTierConfig(userTier);

    if (tierConfig.historyAccess === "none") {
      return NextResponse.json(
        { success: false, error: "Upgrade to access analysis history.", code: "TIER_LOCKED" },
        { status: 403 }
      );
    }

    try {
      const where: Record<string, unknown> = { userId: session.user.id };
      if (tierConfig.historyAccess === "limited" && tierConfig.historyDays !== Infinity) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - tierConfig.historyDays);
        where.createdAt = { gte: cutoff };
      }

      const analyses = await prisma.analysis.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
        distinct: ["id"],
        include: { _count: { select: { claims: true } } },
      });

      const items: AnalysisListItem[] = analyses.map((a: (typeof analyses)[number]) => ({
        id: a.id,
        videoTitle: a.videoTitle,
        thumbnailUrl: a.thumbnailUrl,
        channelTitle: a.channelTitle,
        status: a.status as Analysis["status"],
        claimCount: a._count.claims,
        createdAt: a.createdAt.toISOString(),
      }));

      return NextResponse.json({ success: true, data: items });
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        return NextResponse.json(
          { success: false, error: DATABASE_UNAVAILABLE_MESSAGE },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { success: false, error: "Failed to fetch history." },
        { status: 500 }
      );
    }
  }

  // Single analysis by ID
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Analysis ID is required." },
      { status: 400 }
    );
  }

  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: { claims: true },
    });

    if (!analysis) {
      return NextResponse.json(
        { success: false, error: "Analysis not found." },
        { status: 404 }
      );
    }

    const response: Analysis = {
      id: analysis.id,
      videoId: analysis.videoId,
      videoTitle: analysis.videoTitle,
      videoUrl: analysis.videoUrl,
      channelTitle: analysis.channelTitle,
      thumbnailUrl: analysis.thumbnailUrl,
      duration: analysis.duration,
      publishedAt: analysis.publishedAt?.toISOString(),
      summary: analysis.summary as Summary | null,
      claims: analysis.claims.map((c: (typeof analysis.claims)[number]) => ({
        id: c.id,
        text: c.text,
        type: c.type.toLowerCase() as FactCheckedClaim["type"],
        status: c.status.toLowerCase() as FactCheckedClaim["status"],
        confidence: c.confidence,
        reasoning: c.reasoning ?? "",
        sources: (c.sources as unknown as FactCheckedClaim["sources"]) ?? [],
        timestamp: c.timestamp ?? undefined,
      })),
      status: analysis.status as Analysis["status"],
      createdAt: analysis.createdAt.toISOString(),
      updatedAt: analysis.updatedAt.toISOString(),
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json(
        { success: false, error: DATABASE_UNAVAILABLE_MESSAGE },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch analysis." },
      { status: 500 }
    );
  }
}

async function processAnalysis(
  analysisId: string,
  transcript: string,
  videoTitle: string,
  locale: string,
  maxClaims: number = 8
): Promise<void> {
  const prisma = getPrismaClient();
  if (!prisma) {
    return;
  }

  try {
    // Step 1: Generate summary
    const summary = await generateSummary(transcript, videoTitle, locale);

    // Step 2: Extract claims
    const claims = await extractClaims(transcript, locale, maxClaims);

    // Step 3: Fact-check claims
    const factCheckedClaims = await factCheckClaims(claims, locale);

    // Save results
    await prisma.$transaction([
      prisma.analysis.update({
        where: { id: analysisId },
        data: {
          summary: JSON.parse(JSON.stringify(summary)),
          status: "COMPLETE",
        },
      }),
      ...factCheckedClaims.map((claim) =>
        prisma.claim.create({
          data: {
            analysisId,
            text: claim.text,
            type: claim.type.toUpperCase() as "FACTUAL" | "OPINION" | "PREDICTION",
            status: claim.status.toUpperCase() as "SUPPORTED" | "CONTESTED" | "OPINION" | "INSUFFICIENT",
            confidence: claim.confidence,
            reasoning: claim.reasoning,
            sources: JSON.parse(JSON.stringify(claim.sources)),
            timestamp: claim.timestamp ?? null,
          },
        })
      ),
    ]);
  } catch (error) {
    console.error("Analysis processing failed:", error);
    if (!isDatabaseUnavailableError(error)) {
      const message = getErrorMessage(
        error,
        "Analysis failed during processing. Please try another video."
      );

      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          status: "FAILED",
          summary: { error: message },
        },
      });
    }
  }
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
