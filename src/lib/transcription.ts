/**
 * Transcription module — fetches captions using multiple strategies.
 *
 * Strategy 1: YouTube get_transcript endpoint (works from cloud/Vercel IPs)
 *   - Extracts innertubeApiKey + serializedShareEntity from watch page
 *   - POSTs to /youtubei/v1/get_transcript — separate from player API
 *   - Not affected by IP-based captionTrack stripping
 *
 * Strategy 2: Watch page captionTracks + signed baseUrl (residential IPs)
 *   - Extracts captionTracks with signed URLs from ytInitialPlayerResponse
 *   - Fetches content via signed baseUrl (json3 format)
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

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * Fetch the YouTube watch page HTML (shared by multiple strategies).
 */
async function fetchWatchPageHtml(videoId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`,
      {
        headers: {
          "User-Agent": BROWSER_UA,
          "Accept-Language": "en-US,en;q=0.9",
        },
      }
    );
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

// ─── Strategy 1: get_transcript endpoint ────────────────────────────────────

/**
 * Uses YouTube's get_transcript endpoint which returns transcript data directly.
 * This endpoint is separate from the player API and is NOT affected by IP-based
 * bot detection that strips captionTracks from cloud provider IPs.
 *
 * Flow:
 *   1. Fetch watch page → extract innertubeApiKey + serializedShareEntity
 *   2. POST to /youtubei/v1/get_transcript with serializedShareEntity as params
 *   3. Parse the structured transcript response
 */
async function fetchViaGetTranscript(
  videoId: string,
  html: string
): Promise<TranscriptResponse | null> {
  try {
    const apiKeyMatch = html.match(/innertubeApiKey":"([^"]+)"/);
    const shareEntityMatch = html.match(/serializedShareEntity":"([^"]+)"/);
    const visitorDataMatch = html.match(/visitorData":"([^"]+)"/);

    if (!apiKeyMatch?.[1] || !shareEntityMatch?.[1]) {
      console.warn("[transcript] get_transcript: missing apiKey or shareEntity from page");
      return null;
    }

    const innertubeApiKey = apiKeyMatch[1];
    const serializedShareEntity = shareEntityMatch[1];
    const visitorData = visitorDataMatch?.[1];

    console.log(`[transcript] get_transcript: found apiKey + shareEntity, posting...`);

    const response = await fetch(
      `https://www.youtube.com/youtubei/v1/get_transcript?key=${encodeURIComponent(innertubeApiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": BROWSER_UA,
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: "WEB",
              clientVersion: "2.20240101.00.00",
              ...(visitorData ? { visitorData } : {}),
            },
          },
          params: serializedShareEntity,
        }),
      }
    );

    if (!response.ok) {
      console.warn(`[transcript] get_transcript returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    return parseGetTranscriptResponse(data);
  } catch (error) {
    console.warn(
      "[transcript] get_transcript failed:",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function parseGetTranscriptResponse(data: any): TranscriptResponse | null {
  try {
    const actions = data?.actions;
    if (!Array.isArray(actions)) return null;

    for (const action of actions) {
      const panel = action?.updateEngagementPanelAction?.content?.transcriptRenderer;
      if (!panel) continue;

      const body =
        panel?.content?.transcriptSearchPanelRenderer?.body ??
        panel?.body;

      const segmentList = body?.transcriptSegmentListRenderer;
      const initialSegments = segmentList?.initialSegments;

      if (!Array.isArray(initialSegments)) continue;

      const segments: TranscriptSegment[] = [];

      for (const seg of initialSegments) {
        const renderer = seg?.transcriptSegmentRenderer;
        if (!renderer) continue;

        const text = (renderer.snippet?.runs as any[])
          ?.map((r: any) => r.text)
          .join("")
          .trim();

        if (!text) continue;

        const startMs = parseInt(renderer.startMs ?? "0", 10);
        const endMs = parseInt(renderer.endMs ?? "0", 10);

        segments.push({
          text,
          start: startMs / 1000,
          duration: Math.max((endMs - startMs) / 1000, 0),
        });
      }

      if (segments.length > 0) {
        return {
          transcript: segments.map((s) => s.text).join(" "),
          segments,
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ─── Strategy 2: Watch page captionTracks + signed baseUrl ──────────────────

/**
 * Extracts captionTracks (with signed baseUrl) from the watch page's
 * ytInitialPlayerResponse. Works on residential IPs where YouTube doesn't
 * strip caption data. Uses bracket-depth JSON parser for robust extraction.
 */
async function fetchViaCaptionTracks(
  videoId: string,
  html: string
): Promise<TranscriptResponse | null> {
  try {
    const captionIndex = html.indexOf('"captionTracks":');
    if (captionIndex === -1) return null;

    const arrayStart = html.indexOf("[", captionIndex);
    if (arrayStart === -1) return null;

    let depth = 0;
    let arrayEnd = -1;
    for (let i = arrayStart; i < html.length; i++) {
      if (html[i] === "[" || html[i] === "{") depth++;
      else if (html[i] === "]" || html[i] === "}") {
        depth--;
        if (depth === 0) {
          arrayEnd = i;
          break;
        }
      }
    }
    if (arrayEnd === -1) return null;

    let captionTracks: Array<{ baseUrl: string; languageCode: string }>;
    try {
      captionTracks = JSON.parse(html.slice(arrayStart, arrayEnd + 1));
    } catch {
      return null;
    }

    if (captionTracks.length === 0) return null;

    console.log(
      `[transcript] captionTracks: found ${captionTracks.length} tracks (${captionTracks.map((t) => t.languageCode).join(", ")})`
    );

    // Prefer English track
    const englishTrack = captionTracks.find(
      (t) => t.languageCode === "en" || t.languageCode.startsWith("en-")
    );
    const track = englishTrack ?? captionTracks[0];

    if (!track.baseUrl) return null;

    // Validate URL origin
    try {
      const url = new URL(track.baseUrl);
      if (!url.hostname.endsWith(".youtube.com")) return null;
    } catch {
      return null;
    }

    // Fetch content in json3 format using the signed baseUrl
    const captionUrl = `${track.baseUrl}&fmt=json3`;
    const captionResponse = await fetch(captionUrl, {
      headers: { "User-Agent": BROWSER_UA },
    });

    if (!captionResponse.ok) return null;

    const rawText = await captionResponse.text();
    if (rawText.length < 10) return null;

    // Try json3 parse
    if (rawText.trim().startsWith("{")) {
      try {
        const captionData = JSON.parse(rawText);
        const result = parseJson3Format(captionData);
        if (result) return result;
      } catch {
        /* fall through to XML */
      }
    }

    // Try XML parse
    if (rawText.includes("<text")) {
      return parseXmlFormat(rawText);
    }

    return null;
  } catch (error) {
    console.warn(
      "[transcript] captionTracks failed:",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

/**
 * Parse YouTube's json3 caption format.
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
  return { transcript: segments.map((s) => s.text).join(" "), segments };
}

/**
 * Parse YouTube's XML caption format.
 */
function parseXmlFormat(xml: string): TranscriptResponse | null {
  const segments: TranscriptSegment[] = [];
  const regex = /<text start="([^"]*)" dur="([^"]*)"[^>]*>([^<]*)<\/text>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const text = match[3]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
    if (text) {
      segments.push({
        text,
        start: parseFloat(match[1]),
        duration: parseFloat(match[2]),
      });
    }
  }
  if (segments.length === 0) return null;
  return { transcript: segments.map((s) => s.text).join(" "), segments };
}

// ─── Main entry point ───────────────────────────────────────────────────────

export async function fetchTranscript(videoId: string): Promise<TranscriptResponse> {
  console.log(`[transcript] Fetching transcript for videoId: ${videoId}`);

  // Fetch watch page once (shared by strategies 1 & 2)
  const html = await fetchWatchPageHtml(videoId);

  if (html) {
    // Strategy 1: get_transcript endpoint (works from cloud/Vercel IPs)
    const getTranscriptResult = await fetchViaGetTranscript(videoId, html);
    if (getTranscriptResult) {
      console.log(
        `[transcript] Success via get_transcript (${getTranscriptResult.segments.length} segments)`
      );
      return getTranscriptResult;
    }

    // Strategy 2: captionTracks with signed baseUrl (works on residential IPs)
    const captionTracksResult = await fetchViaCaptionTracks(videoId, html);
    if (captionTracksResult) {
      console.log(
        `[transcript] Success via captionTracks (${captionTracksResult.segments.length} segments)`
      );
      return captionTracksResult;
    }
  } else {
    console.warn("[transcript] Failed to fetch watch page");
  }

  console.warn(`[transcript] All strategies failed for videoId: ${videoId}`);
  throw new Error(NO_CAPTIONS_FRIENDLY_MESSAGE);
}

export async function whisperTranscribe(_videoId: string): Promise<TranscriptResponse> {
  throw new Error(
    "Whisper transcription is not yet implemented. Please use a video with captions."
  );
}
