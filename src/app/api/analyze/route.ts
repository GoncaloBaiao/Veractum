import { NextRequest, NextResponse } from "next/server";
import {
  getPrismaClient,
  DATABASE_UNAVAILABLE_MESSAGE,
  isDatabaseUnavailableError,
} from "@/lib/prisma";
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

    // Create analysis record
    const analysis = await prisma.analysis.create({
      data: {
        videoId,
        videoTitle: metadata.title,
        videoUrl: url.trim(),
        channelTitle: metadata.channelTitle,
        thumbnailUrl: metadata.thumbnailUrl,
        duration: metadata.duration,
        publishedAt: metadata.publishedAt ? new Date(metadata.publishedAt) : null,
        status: "PROCESSING",
      },
    });

    // Process in background (non-blocking)
    processAnalysis(analysis.id, videoId, metadata.title).catch(console.error);

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
    try {
      // For MVP, return all analyses (auth check would go here)
      const analyses = await prisma.analysis.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
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

async function processAnalysis(analysisId: string, videoId: string, videoTitle: string): Promise<void> {
  const prisma = getPrismaClient();
  if (!prisma) {
    return;
  }

  try {
    // Step 1: Fetch transcript
    const { transcript } = await fetchTranscript(videoId);

    // Step 2: Generate summary
    const summary = await generateSummary(transcript, videoTitle);

    // Step 3: Extract claims
    const claims = await extractClaims(transcript);

    // Step 4: Fact-check claims
    const factCheckedClaims = await factCheckClaims(claims);

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
      await prisma.analysis.update({
        where: { id: analysisId },
        data: { status: "FAILED" },
      });
    }
  }
}
