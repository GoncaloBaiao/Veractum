/**
 * Transcription module — fetches captions from YouTube or falls back to
 * Whisper-based transcription for videos without captions.
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

/**
 * Fetch the transcript for a YouTube video.
 * Strategy:
 *   1. Try to fetch auto-generated / manual captions via the innertube API
 *   2. Fall back to Whisper transcription (requires audio download)
 *
 * For the MVP, this uses a lightweight caption scraping approach that
 * doesn't require OAuth credentials.
 */
export async function fetchTranscript(videoId: string): Promise<TranscriptResponse> {
  // Attempt caption fetch via YouTube's timedtext endpoint
  const captions = await fetchYouTubeCaptions(videoId);

  if (captions) {
    return captions;
  }

  // Whisper fallback — not yet implemented for MVP
  throw new Error(
    "No captions available for this video. Whisper transcription is not yet enabled."
  );
}

async function fetchYouTubeCaptions(videoId: string): Promise<TranscriptResponse | null> {
  try {
    // Fetch the video page to extract caption track URLs
    const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
    const response = await fetch(watchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // Extract captions JSON from the page
    const captionMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
    if (!captionMatch?.[1]) {
      return null;
    }

    let captionTracks: Array<{ baseUrl: string; languageCode: string }>;
    try {
      captionTracks = JSON.parse(captionMatch[1]);
    } catch {
      return null;
    }

    if (captionTracks.length === 0) {
      return null;
    }

    // Prefer English track
    const englishTrack = captionTracks.find(
      (t) => t.languageCode === "en" || t.languageCode.startsWith("en-")
    );
    const track = englishTrack ?? captionTracks[0];

    // Fetch the actual captions in XML format
    const captionUrl = `${track.baseUrl}&fmt=json3`;
    const captionResponse = await fetch(captionUrl);

    if (!captionResponse.ok) {
      return null;
    }

    const captionData = await captionResponse.json();
    const events: Array<{ tStartMs: number; dDurationMs: number; segs?: Array<{ utf8: string }> }> =
      captionData.events ?? [];

    const segments: TranscriptSegment[] = [];
    const textParts: string[] = [];

    for (const event of events) {
      if (!event.segs) continue;
      const text = event.segs.map((s) => s.utf8).join("").trim();
      if (!text) continue;

      segments.push({
        text,
        start: (event.tStartMs ?? 0) / 1000,
        duration: (event.dDurationMs ?? 0) / 1000,
      });
      textParts.push(text);
    }

    if (segments.length === 0) {
      return null;
    }

    return {
      transcript: textParts.join(" "),
      segments,
    };
  } catch {
    return null;
  }
}

/**
 * Placeholder for Whisper-based transcription.
 * In production, this would:
 *   1. Download audio from YouTube (yt-dlp)
 *   2. Send to OpenAI Whisper API
 *   3. Return timestamped transcript
 */
export async function whisperTranscribe(_videoId: string): Promise<TranscriptResponse> {
  throw new Error(
    "Whisper transcription is not yet implemented. Please use a video with captions."
  );
}
