const YOUTUBE_REGEX_PATTERNS = [
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
];

export function extractYouTubeId(url: string): string | null {
  for (const pattern of YOUTUBE_REGEX_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  return null;
}

export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null;
}

export function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return isoDuration;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/maxresdefault.jpg`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export const ANALYSIS_STEPS = [
  "Fetching transcript…",
  "Generating summary…",
  "Extracting claims…",
  "Fact-checking…",
] as const;

export const CLAIM_STATUS_CONFIG = {
  supported: {
    label: "Supported",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
    icon: "CheckCircle",
  },
  contested: {
    label: "Contested",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/30",
    icon: "AlertTriangle",
  },
  opinion: {
    label: "Opinion",
    color: "text-gray-400",
    bg: "bg-gray-400/10",
    border: "border-gray-400/30",
    icon: "MessageCircle",
  },
  insufficient: {
    label: "Insufficient Data",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
    icon: "HelpCircle",
  },
} as const;

export const PRICING_TIERS = [
  {
    name: "Free",
    price: "€0",
    period: "forever",
    description: "Get started with basic video analysis.",
    features: [
      "5 analyses per month",
      "Basic summary generation",
      "Key point extraction",
      "Standard processing speed",
    ],
    highlighted: false,
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: "€9",
    period: "per month",
    description: "Full fact-checking with sources and history.",
    features: [
      "Unlimited analyses",
      "AI fact-checking with sources",
      "Confidence scoring",
      "Visual timeline",
      "Full analysis history",
      "Priority processing",
    ],
    highlighted: true,
    cta: "Upgrade to Pro",
  },
  {
    name: "Team",
    price: "€29",
    period: "per month",
    description: "Everything in Pro, plus API access and collaboration.",
    features: [
      "Everything in Pro",
      "REST API access",
      "Team dashboard",
      "Shared analysis library",
      "Bulk video analysis",
      "Dedicated support",
    ],
    highlighted: false,
    cta: "Contact Sales",
  },
] as const;

export const NAV_LINKS = [
  { label: "How it Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "History", href: "/history" },
] as const;
