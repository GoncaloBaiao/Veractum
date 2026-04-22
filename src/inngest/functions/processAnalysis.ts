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
    const { analysisId, transcript, videoTitle, locale, maxClaims } = event.data as {
      analysisId: string;
      transcript: string;
      videoTitle: string;
      locale: string;
      maxClaims: number;
    };

    const prisma = getPrismaClient();
    if (!prisma) return;

    // transcript from route.ts is already evenly sampled across the full video.
    // Re-sample to safe AI input sizes — this preserves full-video temporal coverage
    // while keeping Gemini inputs small enough to avoid rate limits or parse errors.
    const summaryTranscript = sampleTranscript(transcript, 15_000);
    const claimsTranscript = sampleTranscript(transcript, 10_000);

    try {
      const [summary, claims] = await Promise.all([
        generateSummary(summaryTranscript, videoTitle, locale),
        extractClaims(claimsTranscript, locale, maxClaims),
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
