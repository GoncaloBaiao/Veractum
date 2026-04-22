import { GoogleGenAI, Type } from "@google/genai";
import type { Summary, Claim, TimelineSegment } from "@/types";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const GEMINI_MODEL = "gemini-2.5-flash";

export const LOCALE_LANGUAGE_MAP: Record<string, string> = {
  en: "English",
  pt: "Portuguese",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  zh: "Chinese",
  ja: "Japanese",
  ru: "Russian",
};

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Sample the transcript evenly across its full length so analysis covers
 * the entire video rather than just the beginning.
 */
export function sampleTranscript(transcript: string, maxChars: number): string {
  if (transcript.length <= maxChars) return transcript;
  const NUM_SAMPLES = 12;
  const sampleSize = Math.floor(maxChars / NUM_SAMPLES);
  const step = Math.floor(transcript.length / NUM_SAMPLES);
  const parts: string[] = [];
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const start = i * step;
    // Snap to next newline so we don't cut mid-sentence
    const snapStart = transcript.indexOf("\n", start);
    const from = snapStart !== -1 && snapStart - start < 200 ? snapStart + 1 : start;
    parts.push(transcript.slice(from, from + sampleSize));
  }
  return parts.join("\n\n[...]\n\n");
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
  throw lastError ?? new Error("Gemini request failed.");
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
  videoTitle: string,
  locale: string = "en"
): Promise<Summary> {
  const client = getClient();
  const language = LOCALE_LANGUAGE_MAP[locale] || "English";

  const truncatedTranscript = sampleTranscript(transcript, 60000);

  const result = await withRetry(async () => {
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Respond entirely in ${language}. All text fields in your response must be in ${language}.

You are an expert video analyst. Given a video transcript and title, produce a structured summary in JSON format. Be precise, factual, and comprehensive.

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
- overview should be a concise high-level summary

Video title: "${videoTitle}"

Transcript:
${truncatedTranscript}`,
      config: {
        temperature: 0.3,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            segments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING },
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  durationSeconds: { type: Type.NUMBER },
                },
                required: ["topic", "startTime", "endTime", "durationSeconds"],
              },
            },
          },
          required: ["overview", "keyPoints", "segments"],
        },
      },
    });

    const content = response.text;
    if (!content) {
      throw new Error("No response content from Gemini.");
    }

    return JSON.parse(content) as Record<string, unknown>;
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

export async function extractClaims(transcript: string, locale: string = "en", maxClaims: number = 8): Promise<Claim[]> {
  const client = getClient();
  const language = LOCALE_LANGUAGE_MAP[locale] || "English";

  const truncatedTranscript = sampleTranscript(transcript, 60000);

  let result: Record<string, unknown>;
  try {
    result = await withRetry(async () => {
      const response = await client.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Respond entirely in ${language}. All text fields in your response must be in ${language}.

You are an expert fact-checker and claim analyst. Given a video transcript, extract the most important verifiable claims.

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
- Extract up to ${maxClaims} of the most important and verifiable claims. Keep each claim text under 150 characters.
- "factual" = a statement that can be verified as true/false with evidence
- "opinion" = a subjective statement or value judgment
- "prediction" = a statement about the future
- confidence starts at 50 (neutral) — this is pre-verification confidence
- Only extract clear, specific claims — not vague or trivial statements
- Timestamps are approximate based on position in transcript
- Paraphrase for clarity if needed, but stay faithful to the original meaning

Transcript:
${truncatedTranscript}`,
      config: {
        temperature: 0.2,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            claims: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["factual", "opinion", "prediction"] },
                  timestamp: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                },
                required: ["text", "type", "confidence"],
              },
            },
          },
          required: ["claims"],
        },
      },
    });

    const content = response.text;
    if (!content) {
      throw new Error("No response content from Gemini.");
    }

    return JSON.parse(content) as Record<string, unknown>;
    });
  } catch {
    console.error("extractClaims: JSON parse failed after retries, returning empty claims");
    return [];
  }

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
