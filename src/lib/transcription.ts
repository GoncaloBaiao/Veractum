/**
 * Transcription module — fetches YouTube captions via InnerTube API.
 *
 * Tries multiple InnerTube client types sequentially until one returns
 * captionTracks with working baseUrls. Only ANDROID and IOS clients
 * return usable caption data; other client types are blocked or deprecated.
 *
 * Order: ANDROID → IOS → Watch page scraping (last resort)
 *
 * Each client's baseUrl is validated by actually fetching content (≥50 bytes)
 * before being accepted, since some clients return tracks but empty content.
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

const INNERTUBE_URL = "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";

interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
}

/**
 * InnerTube client configurations.
 * Only ANDROID and IOS are known to return working captionTracks.
 */
const INNERTUBE_CLIENTS = [
  {
    label: "ANDROID",
    userAgent: "com.google.android.youtube/20.10.38 (Linux; U; Android 14)",
    body: (videoId: string) => ({
      context: { client: { clientName: "ANDROID", clientVersion: "20.10.38" } },
      videoId,
    }),
  },
  {
    label: "IOS",
    userAgent: "com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_0 like Mac OS X)",
    body: (videoId: string) => ({
      context: {
        client: {
          clientName: "IOS",
          clientVersion: "20.10.4",
          deviceMake: "Apple",
          deviceModel: "iPhone16,2",
          osName: "iPhone",
          osVersion: "18.0.0.22A5321d",
        },
      },
      videoId,
    }),
  },
];

// ─── InnerTube client fetching ──────────────────────────────────────────────

async function fetchTracksViaInnerTube(
  videoId: string,
  client: (typeof INNERTUBE_CLIENTS)[number]
): Promise<CaptionTrack[]> {
  try {
    const response = await fetch(INNERTUBE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": client.userAgent,
      },
      body: JSON.stringify(client.body(videoId)),
    });

    if (!response.ok) {
      console.warn(`[transcript] ${client.label} returned ${response.status}`);
      return [];
    }

    const data = await response.json();
    const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!Array.isArray(tracks) || tracks.length === 0) {
      console.warn(`[transcript] ${client.label}: no captionTracks in response`);
      return [];
    }

    console.log(`[transcript] ${client.label}: ${tracks.length} tracks found`);
    return tracks;
  } catch (error) {
    console.warn(
      `[transcript] ${client.label} failed:`,
      error instanceof Error ? error.message : error
    );
    return [];
  }
}

// ─── Watch page scraping (last resort) ──────────────────────────────────────

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

// ─── Track selection & content fetching ─────────────────────────────────────

function selectTrack(tracks: CaptionTrack[]): CaptionTrack | null {
  if (tracks.length === 0) return null;

  const englishTrack = tracks.find(
    (t) => t.languageCode === "en" || t.languageCode.startsWith("en-")
  );
  const track = englishTrack ?? tracks[0];

  if (!track.baseUrl) return null;

  try {
    const url = new URL(track.baseUrl);
    if (!url.hostname.endsWith(".youtube.com")) return null;
  } catch {
    return null;
  }

  return track;
}

/**
 * Try to fetch and parse caption content from a track's baseUrl.
 * Returns null if the content is empty or unparseable.
 */
async function tryFetchCaptionContent(
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
    if (text.length < 50) {
      console.warn(`[transcript] Caption content too short (${text.length} bytes)`);
      return null;
    }

    return parseXml(text);
  } catch (error) {
    console.warn(
      "[transcript] Caption fetch failed:",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

// ─── XML parsing ────────────────────────────────────────────────────────────

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
    let text = "";
    const sRegex = /<s[^>]*>([^<]*)<\/s>/g;
    let sMatch;
    while ((sMatch = sRegex.exec(inner)) !== null) {
      text += sMatch[1];
    }
    if (!text) text = inner.replace(/<[^>]+>/g, "");
    text = decodeEntities(text).replace(/\n/g, " ").trim();
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

  // Legacy: <text start="s" dur="s">text</text>
  const textRegex = /<text start="([^"]*)" dur="([^"]*)"[^>]*>([\s\S]*?)<\/text>/g;
  while ((match = textRegex.exec(xml)) !== null) {
    const text = decodeEntities(match[3]).replace(/\n/g, " ").trim();
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
  // Double-encoded entities like &amp;#39; → &#39; → '
  let decoded = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
  // Second pass for double-encoded
  decoded = decoded
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
  return decoded;
}

// ─── Main entry point ───────────────────────────────────────────────────────

export async function fetchTranscript(videoId: string): Promise<TranscriptResponse> {
  console.log(`[transcript] Fetching transcript for videoId: ${videoId}`);

  // Try each InnerTube client (ANDROID → IOS)
  for (const client of INNERTUBE_CLIENTS) {
    const tracks = await fetchTracksViaInnerTube(videoId, client);
    if (tracks.length > 0) {
      const track = selectTrack(tracks);
      if (track) {
        const result = await tryFetchCaptionContent(track, client.userAgent);
        if (result) {
          console.log(
            `[transcript] Success via ${client.label} (${result.segments.length} segments)`
          );
          return result;
        }
      }
    }
  }

  // Last resort: Watch page scraping
  const pageTracks = await fetchTracksViaWatchPage(videoId);
  if (pageTracks.length > 0) {
    const track = selectTrack(pageTracks);
    if (track) {
      const result = await tryFetchCaptionContent(track, BROWSER_UA);
      if (result) {
        console.log(
          `[transcript] Success via Watch page (${result.segments.length} segments)`
        );
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
