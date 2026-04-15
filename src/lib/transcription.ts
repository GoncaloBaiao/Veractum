/**
 * Transcription module — fetches captions using YouTube Data API v3 + timedtext.
 * The Data API is resilient to IP-based bot detection unlike scraping approaches.
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

function getYouTubeApiKey(): string | null {
  return process.env.YOUTUBE_API_KEY ?? null;
}

/**
 * Strategy 1: YouTube Data API v3 → timedtext URL
 * Uses the official API to discover caption tracks, then fetches content directly.
 */
async function fetchViaDataApi(videoId: string): Promise<TranscriptResponse | null> {
  const apiKey = getYouTubeApiKey();
  if (!apiKey) return null;

  try {
    // Step 1: Get caption track list from Data API v3
    const listUrl = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${encodeURIComponent(videoId)}&key=${encodeURIComponent(apiKey)}`;
    const listResponse = await fetch(listUrl);
    if (!listResponse.ok) {
      console.warn(`[transcript] DataAPI captions list failed: ${listResponse.status}`);
      return null;
    }

    const listData = await listResponse.json();
    const items: Array<{ id: string; snippet: { language: string; trackKind: string } }> =
      listData.items ?? [];

    if (items.length === 0) return null;

    // Prefer standard English track (not ASR auto-generated)
    const preferred =
      items.find((i) => (i.snippet.language === "en" || i.snippet.language.startsWith("en-")) && i.snippet.trackKind === "standard") ??
      items.find((i) => i.snippet.language === "en" || i.snippet.language.startsWith("en-")) ??
      items.find((i) => i.snippet.trackKind === "standard") ??
      items[0];

    if (!preferred) return null;

    // Step 2: Fetch caption content via timedtext URL (json3 format)
    const timedtextUrl = `https://www.youtube.com/api/timedtext?v=${encodeURIComponent(videoId)}&lang=${encodeURIComponent(preferred.snippet.language)}&fmt=json3&xorb=2&xobt=3&xovt=3`;
    const captionResponse = await fetch(timedtextUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.youtube.com/",
      },
    });

    if (!captionResponse.ok) {
      console.warn(`[transcript] timedtext fetch failed: ${captionResponse.status}`);
      return null;
    }

    const captionData = await captionResponse.json();
    return parseJson3Format(captionData);
  } catch (error) {
    console.warn("DataAPI transcript fetch failed:", error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Strategy 2: Innertube API with WEB client
 * The WEB client returns captionTracks more reliably than ANDROID from cloud IPs.
 */
async function fetchViaInnertubeWeb(videoId: string): Promise<TranscriptResponse | null> {
  try {
    const response = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "X-YouTube-Client-Name": "1",
        "X-YouTube-Client-Version": "2.20240101.00.00",
        "Origin": "https://www.youtube.com",
        "Referer": "https://www.youtube.com/",
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "WEB",
            clientVersion: "2.20240101.00.00",
            hl: "en",
            gl: "US",
          },
        },
        videoId,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const tracks: Array<{ baseUrl: string; languageCode: string }> =
      data?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];

    if (tracks.length === 0) return null;

    const englishTrack =
      tracks.find((t) => t.languageCode === "en") ??
      tracks.find((t) => t.languageCode.startsWith("en-")) ??
      tracks[0];

    if (!englishTrack?.baseUrl) return null;

    // Fetch with json3 format
    const captionUrl = `${englishTrack.baseUrl}&fmt=json3`;
    const captionResponse = await fetch(captionUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://www.youtube.com/",
      },
    });

    if (!captionResponse.ok) return null;

    const captionData = await captionResponse.json();
    return parseJson3Format(captionData);
  } catch (error) {
    console.warn("InnertubeWEB transcript fetch failed:", error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Parse YouTube's json3 caption format into segments.
 */
function parseJson3Format(data: {
  events?: Array<{
    tStartMs?: number;
    dDurationMs?: number;
    segs?: Array<{ utf8?: string }>;
  }>;
}): TranscriptResponse | null {
  const events = data?.events ?? [];
  const segments: TranscriptSegment[] = [];

  for (const event of events) {
    if (!event.segs) continue;
    const text = event.segs
      .map((s) => s.utf8 ?? "")
      .join("")
      .replace(/\n/g, " ")
      .trim();
    if (!text || text === " ") continue;
    segments.push({
      text,
      start: (event.tStartMs ?? 0) / 1000,
      duration: (event.dDurationMs ?? 0) / 1000,
    });
  }

  if (segments.length === 0) return null;

  return {
    transcript: segments.map((s) => s.text).join(" "),
    segments,
  };
}

export async function fetchTranscript(videoId: string): Promise<TranscriptResponse> {
  console.log(`[transcript] Fetching transcript for videoId: ${videoId}`);

  // Strategy 1: YouTube Data API v3 (official, not affected by IP blocking)
  const dataApiResult = await fetchViaDataApi(videoId);
  if (dataApiResult) {
    console.log(`[transcript] Success via DataAPI (${dataApiResult.segments.length} segments)`);
    return dataApiResult;
  }

  // Strategy 2: Innertube WEB client
  const innertubeResult = await fetchViaInnertubeWeb(videoId);
  if (innertubeResult) {
    console.log(`[transcript] Success via InnertubeWEB (${innertubeResult.segments.length} segments)`);
    return innertubeResult;
  }

  console.warn(`[transcript] All strategies failed for videoId: ${videoId}`);
  throw new Error(NO_CAPTIONS_FRIENDLY_MESSAGE);
}

export async function whisperTranscribe(_videoId: string): Promise<TranscriptResponse> {
  throw new Error("Whisper transcription is not yet implemented. Please use a video with captions.");
}
