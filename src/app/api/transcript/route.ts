import { NextRequest, NextResponse } from "next/server";
import { extractYouTubeId } from "@/lib/utils";
import { fetchTranscript } from "@/lib/transcription";
import type { ApiResponse } from "@/types";

interface TranscriptData {
  transcript: string;
  segmentCount: number;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<TranscriptData>>> {
  try {
    const body = await request.json();
    const url: unknown = body?.url;

    if (typeof url !== "string" || !url.trim()) {
      return NextResponse.json(
        { success: false, error: "A YouTube URL is required." },
        { status: 400 }
      );
    }

    const videoId = extractYouTubeId(url.trim());
    if (!videoId) {
      return NextResponse.json(
        { success: false, error: "Invalid YouTube URL." },
        { status: 400 }
      );
    }

    const result = await fetchTranscript(videoId);

    return NextResponse.json({
      success: true,
      data: {
        transcript: result.transcript,
        segmentCount: result.segments.length,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch transcript.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 422 }
    );
  }
}
