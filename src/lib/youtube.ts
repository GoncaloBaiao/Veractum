import type { VideoMetadata } from "@/types";

interface YouTubeSnippet {
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnails: {
    high: { url: string; width: number; height: number };
    maxres?: { url: string; width: number; height: number };
  };
}

interface YouTubeContentDetails {
  duration: string;
}

interface YouTubeStatistics {
  viewCount: string;
  likeCount: string;
}

interface YouTubeVideoResource {
  id: string;
  snippet: YouTubeSnippet;
  contentDetails: YouTubeContentDetails;
  statistics: YouTubeStatistics;
}

interface YouTubeVideoListResponse {
  items: YouTubeVideoResource[];
}

interface YouTubeCaptionResource {
  id: string;
  snippet: {
    language: string;
    trackKind: string;
    name: string;
  };
}

interface YouTubeCaptionListResponse {
  items: YouTubeCaptionResource[];
}

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new Error("YOUTUBE_API_KEY environment variable is not set");
  }
  return key;
}

export async function getVideoMetadata(videoId: string): Promise<VideoMetadata> {
  const apiKey = getApiKey();
  const url = new URL(`${YOUTUBE_API_BASE}/videos`);
  url.searchParams.set("part", "snippet,contentDetails,statistics");
  url.searchParams.set("id", videoId);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("YouTube API quota exceeded. Please try again later.");
    }
    throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
  }

  const data: YouTubeVideoListResponse = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error("Video not found. Please check the URL and try again.");
  }

  const video = data.items[0];
  const thumbnail = video.snippet.thumbnails.maxres ?? video.snippet.thumbnails.high;

  return {
    videoId,
    title: video.snippet.title,
    description: video.snippet.description,
    channelTitle: video.snippet.channelTitle,
    thumbnailUrl: thumbnail.url,
    duration: video.contentDetails.duration,
    publishedAt: video.snippet.publishedAt,
    viewCount: video.statistics.viewCount,
    likeCount: video.statistics.likeCount,
  };
}

export async function getVideoCaptions(videoId: string): Promise<string | null> {
  const apiKey = getApiKey();
  const url = new URL(`${YOUTUBE_API_BASE}/captions`);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("videoId", videoId);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());

  if (!response.ok) {
    return null;
  }

  const data: YouTubeCaptionListResponse = await response.json();

  if (!data.items || data.items.length === 0) {
    return null;
  }

  const englishTrack = data.items.find(
    (item) => item.snippet.language === "en" || item.snippet.language.startsWith("en-")
  );

  const track = englishTrack ?? data.items[0];

  // Note: Downloading captions requires OAuth. For production, use a
  // third-party transcript API or the transcription module as fallback.
  // This returns the track ID for reference.
  return track.id;
}
