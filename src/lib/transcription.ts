/**
 * Transcription module — fetches YouTube captions via InnerTube API.
 *
 * Strategy 1: Android InnerTube player → captionTracks with signed baseUrls → XML
 * Strategy 2: WEB InnerTube player → same (fallback)
 * Strategy 3: Watch page HTML scraping → captionTracks (fallback)
 *
 * The Android client consistently returns captionTracks with working signed URLs.
 * Content is returned as XML in `<p t="ms" d="ms">text</p>` format.
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
const ANDROID_UA = "com.google.android.youtube/20.10.38 (Linux; U; Android 14)";
const INNERTUBE_URL = "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";

interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
}

// ─── Strategy 1: Android InnerTube ──────────────────────────────────────────

async function fetchTracksViaAndroid(videoId: string): Promise<CaptionTrack[]> {
  try {
    const response = await fetch(INNERTUBE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": ANDROID_UA,
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "ANDROID",
            clientVersion: "20.10.38",
          },
        },
        videoId,
      }),
    });

    if (!response.ok) {
      console.warn(`[transcript] Android InnerTube returned ${response.status}`);
      return [];
    }

    const data = await response.json();
    const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!Array.isArray(tracks) || tracks.length === 0) {
      console.warn("[transcript] Android InnerTube: no captionTracks in response");
      return [];
    }

    console.log(
      `[transcript] Android InnerTube: ${tracks.length} tracks (${tracks.slice(0, 5).map((t: CaptionTrack) => t.languageCode).join(", ")}${tracks.length > 5 ? "..." : ""})`
    );
    return tracks;
  } catch (error) {
    console.warn("[transcript] Android InnerTube failed:", error instanceof Error ? error.message : error);
    return [];
  }
}

// ─── Strategy 2: WEB InnerTube ──────────────────────────────────────────────

async function fetchTracksViaWeb(videoId: string): Promise<CaptionTrack[]> {
  try {
    const response = await fetch(INNERTUBE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": BROWSER_UA,
        "X-YouTube-Client-Name": "1",
        "X-YouTube-Client-Version": "2.20240101.00.00",
        Origin: "https://www.youtube.com",
        Referer: "https://www.youtube.com/",
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

    if (!response.ok) return [];

    const data = await response.json();
    const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!Array.isArray(tracks) || tracks.length === 0) return [];

    console.log(`[transcript] WEB InnerTube: ${tracks.length} tracks`);
    return tracks;
  } catch {
    return [];
  }
}

// ─── Strategy 3: Watch page HTML scraping ───────────────────────────────────

async function fetchTracksViaWatchPage(videoId: string): Promise<CaptionTrack[]> {
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

    if (!response.ok) return [];

    const html = await response.text();

    const captionIndex = html.indexOf('"captionTracks":');
    if (captionIndex === -1) return [];

    const arrayStart = html.indexOf("[", captionIndex);
    if (arrayStart === -1) return [];

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
    if (arrayEnd === -1) return [];

    try {
      const tracks = JSON.parse(html.slice(arrayStart, arrayEnd + 1));
      if (Array.isArray(tracks) && tracks.length > 0) {
        console.log(`[transcript] Watch page: ${tracks.length} tracks`);
        return tracks;
      }
    } catch {
      /* parse failed */
    }

    return [];
  } catch {
    return [];
  }
}

// ─── Caption content fetching & parsing ─────────────────────────────────────

function selectTrack(tracks: CaptionTrack[]): CaptionTrack | null {
  if (tracks.length === 0) return null;

  const englishTrack = tracks.find(
    (t) => t.languageCode === "en" || t.languageCode.startsWith("en-")
  );
  const track = englishTrack ?? tracks[0];

  if (!track.baseUrl) return null;

  // Validate URL origin
  try {
    const url = new URL(track.baseUrl);
    if (!url.hostname.endsWith(".youtube.com")) return null;
  } catch {
    return null;
  }

  return track;
}

async function fetchCaptionContent(
  track: CaptionTrack,
  userAgent: string
): Promise<TranscriptResponse | null> {
  try {
    const response = await fetch(track.baseUrl, {
      headers: { "User-Agent": userAgent },
    });

    if (!response.ok) {
      console.warn(`[transcript] Caption fetch returned ${response.status}`);
      return null;
    }

    const text = await response.text();
    if (text.length < 10) {
      console.warn(`[transcript] Caption content empty (${text.length} bytes)`);
      return null;
    }

    // Parse XML — handles both <p t="ms" d="ms"> and <text start="s" dur="s"> formats
    return parseXml(text);
  } catch (error) {
    console.warn("[transcript] Caption fetch failed:", error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Parse YouTube caption XML. Handles two formats:
 * - Format 3: <p t="13960" d="2086">text</p>  (t/d in milliseconds)
 * - Legacy:   <text start="13.96" dur="2.086">text</text>  (seconds)
 */
function parseXml(xml: string): TranscriptResponse | null {
  const segments: TranscriptSegment[] = [];

  // Format 3: <p t="ms" d="ms">text</p>
  const pRegex = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  let match;
  while ((match = pRegex.exec(xml)) !== null) {
    const inner = match[3];
    // Extract text from <s> tags or use raw content
    let text = "";
    const sRegex = /<s[^>]*>([^<]*)<\/s>/g;
    let sMatch;
    while ((sMatch = sRegex.exec(inner)) !== null) {
      text += sMatch[1];
    }
    if (!text) text = inner.replace(/<[^>]+>/g, "");
    text = decodeEntities(text).trim();

    if (text) {
      segments.push({
        text,
        start: parseInt(match[1], 10) / 1000,
        duration: parseInt(match[2], 10) / 1000,
      });
    }
  }

  if (segments.length > 0) {
    return { transcript: segments.map((s) => s.text).join(" "), segments };
  }

  // Legacy format: <text start="s" dur="s">text</text>
  const textRegex = /<text start="([^"]*)" dur="([^"]*)"[^>]*>([^<]*)<\/text>/g;
  while ((match = textRegex.exec(xml)) !== null) {
    const text = decodeEntities(match[3]).trim();
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

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
}

// ─── Main entry point ───────────────────────────────────────────────────────

export async function fetchTranscript(videoId: string): Promise<TranscriptResponse> {
  console.log(`[transcript] Fetching transcript for videoId: ${videoId}`);

  // Strategy 1: Android InnerTube (most reliable — signed URLs that work)
  const androidTracks = await fetchTracksViaAndroid(videoId);
  if (androidTracks.length > 0) {
    const track = selectTrack(androidTracks);
    if (track) {
      const result = await fetchCaptionContent(track, ANDROID_UA);
      if (result) {
        console.log(`[transcript] Success via Android InnerTube (${result.segments.length} segments)`);
        return result;
      }
    }
  }

  // Strategy 2: WEB InnerTube
  const webTracks = await fetchTracksViaWeb(videoId);
  if (webTracks.length > 0) {
    const track = selectTrack(webTracks);
    if (track) {
      const result = await fetchCaptionContent(track, BROWSER_UA);
      if (result) {
        console.log(`[transcript] Success via WEB InnerTube (${result.segments.length} segments)`);
        return result;
      }
    }
  }

  // Strategy 3: Watch page HTML scraping
  const pageTracks = await fetchTracksViaWatchPage(videoId);
  if (pageTracks.length > 0) {
    const track = selectTrack(pageTracks);
    if (track) {
      const result = await fetchCaptionContent(track, BROWSER_UA);
      if (result) {
        console.log(`[transcript] Success via Watch page (${result.segments.length} segments)`);
        return result;
      }
    }
  }

  console.warn(`[transcript] All strategies failed for videoId: ${videoId}`);
  throw new Error(NO_CAPTIONS_FRIENDLY_MESSAGE);
}

export async function whisperTranscribe(_videoId: string): Promise<TranscriptResponse> {
  throw new Error(
    "Whisper transcription is not yet implemented. Please use a video with captions."
  );
}
