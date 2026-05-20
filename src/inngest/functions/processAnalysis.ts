import { inngest } from "@/inngest/client";
import { getPrismaClient, isDatabaseUnavailableError } from "@/lib/prisma";
import { generateSummary, extractClaims, sampleTranscript } from "@/lib/ai";
import { factCheckClaims } from "@/lib/factcheck";
import type { FactCheckedClaim, Summary } from "@/types";

export const processAnalysisJob = inngest.createFunction(
  {
    id: "process-analysis",
    retries: 1,
    timeouts: { finish: "5m" },
    triggers: [{ event: "analysis/process" }],
  },
  async ({ event }) => {
    const { analysisId, transcript, videoTitle, locale, maxClaims, videoDurationSecs, tier } = event.data as {
      analysisId: string;
      transcript: string;
      videoTitle: string;
      locale: string;
      maxClaims: number;
      videoDurationSecs: number;
      tier: string;
    };

    const prisma = getPrismaClient();
    if (!prisma) return;

    // transcript from route.ts is already evenly sampled across the full video.
    // Re-sample to tier-based AI input sizes with real timestamp annotations so Gemini
    // generates claims and segments spread across the full video duration.
    const summaryLimit = tier === "veractor" ? 60_000 : tier === "analyst" ? 25_000 : 15_000;
    const claimsLimit  = tier === "veractor" ? 40_000 : tier === "analyst" ? 15_000 : 10_000;
    const summaryTranscript = sampleTranscript(transcript, summaryLimit, videoDurationSecs);
    const claimsTranscript  = sampleTranscript(transcript, claimsLimit, videoDurationSecs);

    try {
      const [summary, claims] = await Promise.all([
        generateSummary(summaryTranscript, videoTitle, locale, tier),
        extractClaims(claimsTranscript, locale, maxClaims, tier),
      ]);

      const factCheckedClaims = await factCheckClaims(claims, locale, maxClaims);

      await prisma.$transaction([
        prisma.analysis.update({
          where: { id: analysisId },
          data: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            summary: JSON.parse(JSON.stringify(summary)) as any,
            status: "COMPLETE",
          },
        }),
        ...factCheckedClaims.map((claim: FactCheckedClaim) =>
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
      console.error("Inngest processAnalysis failed:", error);
      if (!isDatabaseUnavailableError(error)) {
        await prisma.analysis.update({
          where: { id: analysisId },
          data: {
            status: "FAILED",
            summary: {
              error: error instanceof Error ? error.message : "Analysis failed.",
            },
          },
        });
      }
    }
  }
);
