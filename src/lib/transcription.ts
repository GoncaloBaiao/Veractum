/**
 * Transcription module — fetches YouTube captions via Supadata API.
 * Supadata proxies YouTube transcript requests, bypassing IP-based blocking
 * that affects direct InnerTube API calls from Vercel/AWS serverless environments.
 */

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

interface TranscriptResponse {
  transcript: string;
  segments: TranscriptSegment[];
}

const NO_CAPTIONS_FRIENDLY_MESSAGE =
  "This video does not have captions available. Please try a video with subtitles enabled.";

interface SupadataSegment {
  text: string;
  offset: number;  // milliseconds
  duration: number; // milliseconds
  lang: string;
}

interface SupadataResponse {
  videoId: string;
  content: SupadataSegment[] | string;
  lang: string;
  availableLangs: string[];
}

export async function fetchTranscript(videoId: string): Promise<TranscriptResponse> {
  const apiKey = process.env.SUPADATA_API_KEY;
  if (!apiKey) {
    console.error("[transcript] SUPADATA_API_KEY is not set");
    throw new Error(NO_CAPTIONS_FRIENDLY_MESSAGE);
  }

  // First attempt: segmented transcript (text=false)
  const result = await tryFetchTranscript(videoId, apiKey, false);
  if (result) return result;

  // Fallback: plain text transcript (handles auto-generated / partial captions)
  console.log(`[transcript] Falling back to text=true for ${videoId}`);
  const fallback = await tryFetchTranscript(videoId, apiKey, true);
  if (fallback) return fallback;

  throw new Error(NO_CAPTIONS_FRIENDLY_MESSAGE);
}

async function tryFetchTranscript(
  videoId: string,
  apiKey: string,
  textMode: boolean
): Promise<TranscriptResponse | null> {
  const url = `https://api.supadata.ai/v1/youtube/transcript?videoId=${encodeURIComponent(videoId)}&text=${textMode}`;

  let response: Response;
  try {
    response = await fetch(url, { headers: { "x-api-key": apiKey } });
  } catch (error) {
    console.error("[transcript] Supadata request failed:", error instanceof Error ? error.message : error);
    return null;
  }

  if (response.status === 404) {
    console.warn(`[transcript] Supadata: no transcript for ${videoId}`);
    return null;
  }

  if (!response.ok) {
    console.error(`[transcript] Supadata returned ${response.status}`);
    return null;
  }

  let data: SupadataResponse;
  try {
    data = await response.json();
  } catch {
    console.error("[transcript] Supadata response is not valid JSON");
    return null;
  }

  // text=true returns content as a plain string
  if (textMode) {
    const text = typeof data.content === "string" ? (data.content as string).trim() : "";
    if (!text) return null;
    console.log(`[transcript] Supadata text-mode success: ${text.length} chars, lang: ${data.lang}`);
    return {
      transcript: text,
      segments: [{ text, start: 0, duration: 0 }],
    };
  }

  // text=false returns content as an array of segments
  if (!Array.isArray(data.content) || data.content.length === 0) {
    console.warn(`[transcript] Supadata returned empty segments for ${videoId}`);
    return null;
  }

  const segments: TranscriptSegment[] = (data.content as SupadataSegment[])
    .map((seg) => ({
      text: seg.text.trim(),
      start: seg.offset / 1000,
      duration: seg.duration / 1000,
    }))
    .filter((seg) => seg.text.length > 0);

  if (segments.length === 0) return null;

  console.log(`[transcript] Supadata success: ${segments.length} segments, lang: ${data.lang}`);
  return {
    transcript: segments.map((s) => s.text).join(" "),
    segments,
  };
}

export async function whisperTranscribe(_videoId: string): Promise<TranscriptResponse> {
  throw new Error("Whisper transcription is not yet implemented. Please use a video with captions.");
}
