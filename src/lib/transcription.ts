/**
 * Transcription module — fetches captions using YouTube's Innertube API
 * via youtubei.js, which is resilient to bot detection in serverless environments.
 */

import { Innertube } from "youtubei.js";

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

let innertubeInstance: Awaited<ReturnType<typeof Innertube.create>> | null = null;

async function getInnertube() {
  if (!innertubeInstance) {
    innertubeInstance = await Innertube.create({
      retrieve_player: false,
    });
  }
  return innertubeInstance;
}

export async function fetchTranscript(videoId: string): Promise<TranscriptResponse> {
  try {
    const youtube = await getInnertube();
    const info = await youtube.getInfo(videoId);

    const transcriptData = await info.getTranscript();
    const body = transcriptData?.transcript?.content?.body;
    const segments_raw = body?.initial_segments ?? [];

    if (!segments_raw || segments_raw.length === 0) {
      throw new Error(NO_CAPTIONS_FRIENDLY_MESSAGE);
    }

    const segments: TranscriptSegment[] = segments_raw
      .map((seg: {
        snippet?: { text?: string };
        start_ms?: string | number;
        end_ms?: string | number;
      }) => {
        const text = seg.snippet?.text ?? "";
        const startMs = Number(seg.start_ms ?? 0);
        const endMs = Number(seg.end_ms ?? 0);
        return {
          text: text.replace(/\n/g, " ").trim(),
          start: startMs / 1000,
          duration: (endMs - startMs) / 1000,
        };
      })
      .filter((s: TranscriptSegment) => s.text.length > 0);

    if (segments.length === 0) {
      throw new Error(NO_CAPTIONS_FRIENDLY_MESSAGE);
    }

    const transcript = segments.map((s) => s.text).join(" ");

    return { transcript, segments };
  } catch (error) {
    const message = error instanceof Error ? error.message : NO_CAPTIONS_FRIENDLY_MESSAGE;
    if (message.includes("captions") || message.includes("transcript") || message.includes("Could not find")) {
      throw new Error(NO_CAPTIONS_FRIENDLY_MESSAGE);
    }
    throw new Error(message);
  }
}

/**
 * Placeholder for Whisper-based transcription.
 */
export async function whisperTranscribe(_videoId: string): Promise<TranscriptResponse> {
  throw new Error(
    "Whisper transcription is not yet implemented. Please use a video with captions."
  );
}
