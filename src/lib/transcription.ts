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
  content: SupadataSegment[];
  lang: string;
  availableLangs: string[];
}

export async function fetchTranscript(videoId: string): Promise<TranscriptResponse> {
  console.log(`[transcript] Fetching transcript for videoId: ${videoId}`);

  const apiKey = process.env.SUPADATA_API_KEY;
  if (!apiKey) {
    console.error("[transcript] SUPADATA_API_KEY is not set");
    throw new Error(NO_CAPTIONS_FRIENDLY_MESSAGE);
  }

  const url = `https://api.supadata.ai/v1/youtube/transcript?videoId=${encodeURIComponent(videoId)}&text=false`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "x-api-key": apiKey,
      },
    });
  } catch (error) {
    console.error("[transcript] Supadata request failed:", error instanceof Error ? error.message : error);
    throw new Error(NO_CAPTIONS_FRIENDLY_MESSAGE);
  }

  if (response.status === 404) {
    console.warn(`[transcript] Supadata: no transcript available for ${videoId}`);
    throw new Error(NO_CAPTIONS_FRIENDLY_MESSAGE);
  }

  if (!response.ok) {
    console.error(`[transcript] Supadata returned ${response.status}`);
    throw new Error(NO_CAPTIONS_FRIENDLY_MESSAGE);
  }

  let data: SupadataResponse;
  try {
    data = await response.json();
  } catch {
    console.error("[transcript] Supadata response is not valid JSON");
    throw new Error(NO_CAPTIONS_FRIENDLY_MESSAGE);
  }

  if (!Array.isArray(data.content) || data.content.length === 0) {
    console.warn(`[transcript] Supadata returned empty content for ${videoId}`);
    throw new Error(NO_CAPTIONS_FRIENDLY_MESSAGE);
  }

  const segments: TranscriptSegment[] = data.content.map((seg) => ({
    text: seg.text.trim(),
    start: seg.offset / 1000,      // ms → seconds
    duration: seg.duration / 1000, // ms → seconds
  })).filter((seg) => seg.text.length > 0);

  if (segments.length === 0) {
    throw new Error(NO_CAPTIONS_FRIENDLY_MESSAGE);
  }

  console.log(`[transcript] Supadata success: ${segments.length} segments, lang: ${data.lang}`);

  return {
    transcript: segments.map((s) => s.text).join(" "),
    segments,
  };
}

export async function whisperTranscribe(_videoId: string): Promise<TranscriptResponse> {
  throw new Error("Whisper transcription is not yet implemented. Please use a video with captions.");
}
