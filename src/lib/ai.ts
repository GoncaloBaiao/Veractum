import OpenAI from "openai";
import type { Summary, Claim, TimelineSegment } from "@/types";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  return new OpenAI({ apiKey });
}

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

const SEGMENT_COLORS = [
  "#f59e0b", // amber-500
  "#f97316", // orange-500
  "#eab308", // yellow-500
  "#84cc16", // lime-500
  "#06b6d4", // cyan-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#14b8a6", // teal-500
];

export async function generateSummary(
  transcript: string,
  videoTitle: string
): Promise<Summary> {
  const client = getClient();

  const truncatedTranscript =
    transcript.length > 15000 ? transcript.slice(0, 15000) + "…" : transcript;

  const result = await withRetry(async () => {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an expert video analyst. Given a video transcript and title, produce a structured summary in JSON format. Be precise, factual, and comprehensive.

Return JSON with this exact structure:
{
  "overview": "A 2-3 sentence overview of the entire video",
  "keyPoints": ["Point 1", "Point 2", ...],
  "segments": [
    {
      "topic": "Topic name",
      "startTime": "0:00",
      "endTime": "2:30",
      "durationSeconds": 150
    }
  ]
}

Rules:
- Extract 5-10 key points that capture the most important information
- Divide the video into logical topic segments (3-8 segments)
- Timestamps should be approximate based on position in transcript
- Key points should be specific and informative, not vague
- overview should be a concise high-level summary`,
        },
        {
          role: "user",
          content: `Video title: "${videoTitle}"\n\nTranscript:\n${truncatedTranscript}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response content from OpenAI");
    }
    return JSON.parse(content);
  });

  const segments: TimelineSegment[] = (
    result.segments as Array<{
      topic: string;
      startTime: string;
      endTime: string;
      durationSeconds: number;
    }>
  ).map((seg, index) => ({
    id: `seg-${index}`,
    topic: seg.topic,
    startTime: seg.startTime,
    endTime: seg.endTime,
    durationSeconds: seg.durationSeconds,
    color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
  }));

  return {
    overview: result.overview as string,
    keyPoints: result.keyPoints as string[],
    segments,
  };
}

export async function extractClaims(transcript: string): Promise<Claim[]> {
  const client = getClient();

  const truncatedTranscript =
    transcript.length > 15000 ? transcript.slice(0, 15000) + "…" : transcript;

  const result = await withRetry(async () => {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an expert fact-checker and claim analyst. Given a video transcript, extract the most important verifiable claims.

Return JSON with this exact structure:
{
  "claims": [
    {
      "text": "The exact claim as stated or closely paraphrased",
      "type": "factual" | "opinion" | "prediction",
      "timestamp": "approximate timestamp like 3:45 or null",
      "confidence": 50
    }
  ]
}

Rules:
- Extract up to 15 of the most important and verifiable claims
- "factual" = a statement that can be verified as true/false with evidence
- "opinion" = a subjective statement or value judgment
- "prediction" = a statement about the future
- confidence starts at 50 (neutral) — this is pre-verification confidence
- Only extract clear, specific claims — not vague or trivial statements
- Timestamps are approximate based on position in transcript
- Paraphrase for clarity if needed, but stay faithful to the original meaning`,
        },
        {
          role: "user",
          content: `Transcript:\n${truncatedTranscript}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response content from OpenAI");
    }
    return JSON.parse(content);
  });

  const claims: Claim[] = (
    result.claims as Array<{
      text: string;
      type: string;
      timestamp: string | null;
      confidence: number;
    }>
  ).map((claim, index) => ({
    id: `claim-${index}`,
    text: claim.text,
    type: claim.type as Claim["type"],
    timestamp: claim.timestamp ?? undefined,
    confidence: claim.confidence,
  }));

  return claims;
}
