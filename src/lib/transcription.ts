/**
 * Transcription module — fetches captions directly via YouTube's InnerTube API.
 * No external libraries needed. Uses the Android client endpoint which is
 * resilient to bot detection in serverless environments.
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

const INNERTUBE_URL = "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";
const CLIENT_VERSION = "20.10.38";
const USER_AGENT = `com.google.android.youtube/${CLIENT_VERSION} (Linux; U; Android 14)`;

interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
}

/**
 * Fetch transcript using YouTube's InnerTube API (Android client).
 */
async function fetchViaInnerTube(videoId: string): Promise<CaptionTrack[] | null> {
  try {
    const response = await fetch(INNERTUBE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "ANDROID",
            clientVersion: CLIENT_VERSION,
          },
        },
        videoId,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!Array.isArray(tracks) || tracks.length === 0) return null;
    return tracks;
  } catch {
    return null;
  }
}

/**
 * Fetch transcript by scraping the YouTube watch page (fallback).
 */
async function fetchViaWebPage(videoId: string): Promise<CaptionTrack[] | null> {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Parse ytInitialPlayerResponse
    const marker = "var ytInitialPlayerResponse = ";
    const idx = html.indexOf(marker);
    if (idx === -1) return null;

    const start = idx + marker.length;
    let depth = 0;
    let end = -1;
    for (let i = start; i < html.length; i++) {
      if (html[i] === "{") depth++;
      else if (html[i] === "}") {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }
    if (end === -1) return null;

    let playerResponse;
    try {
      playerResponse = JSON.parse(html.slice(start, end + 1));
    } catch {
      return null;
    }

    const tracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!Array.isArray(tracks) || tracks.length === 0) return null;
    return tracks;
  } catch {
    return null;
  }
}

/**
 * Decode HTML entities in caption text.
 */
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

/**
 * Parse caption XML/timedtext response into segments.
 */
function parseTranscriptXml(xml: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];

  // Try new format: <p t="offset" d="duration"><s>text</s></p>
  const pRegex = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  let match;
  while ((match = pRegex.exec(xml)) !== null) {
    const offset = parseInt(match[1], 10);
    const duration = parseInt(match[2], 10);
    const inner = match[3];

    // Extract text from <s> tags or use raw inner content
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
        start: offset / 1000,
        duration: duration / 1000,
      });
    }
  }

  if (segments.length > 0) return segments;

  // Fallback: old format <text start="..." dur="...">...</text>
  const textRegex = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;
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

  return segments;
}

/**
 * Fetch the transcript for a YouTube video.
 * Strategy:
 *   1. Try InnerTube API (Android client) — resilient to bot detection
 *   2. Fall back to web page scraping
 */
export async function fetchTranscript(videoId: string): Promise<TranscriptResponse> {
  // Get caption tracks via InnerTube first, then web page fallback
  let tracks = await fetchViaInnerTube(videoId);
  if (!tracks) {
    tracks = await fetchViaWebPage(videoId);
  }

  if (!tracks || tracks.length === 0) {
    throw new Error(NO_CAPTIONS_FRIENDLY_MESSAGE);
  }

  // Prefer English track
  const englishTrack = tracks.find(
    (t) => t.languageCode === "en" || t.languageCode.startsWith("en-")
  );
  const track = englishTrack ?? tracks[0];

  // Validate URL origin
  try {
    const url = new URL(track.baseUrl);
    if (!url.hostname.endsWith(".youtube.com")) {
      throw new Error(NO_CAPTIONS_FRIENDLY_MESSAGE);
    }
  } catch {
    throw new Error(NO_CAPTIONS_FRIENDLY_MESSAGE);
  }

  // Fetch the caption content
  const captionResponse = await fetch(track.baseUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36",
    },
  });

  if (!captionResponse.ok) {
    throw new Error(NO_CAPTIONS_FRIENDLY_MESSAGE);
  }

  const xml = await captionResponse.text();
  const segments = parseTranscriptXml(xml);

  if (segments.length === 0) {
    throw new Error(NO_CAPTIONS_FRIENDLY_MESSAGE);
  }

  return {
    transcript: segments.map((s) => s.text).join(" "),
    segments,
  };
}

/**
 * Placeholder for Whisper-based transcription.
 */
export async function whisperTranscribe(_videoId: string): Promise<TranscriptResponse> {
  throw new Error(
    "Whisper transcription is not yet implemented. Please use a video with captions."
  );
}
