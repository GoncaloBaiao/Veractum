/* ─── Video Metadata ─── */

export interface VideoMetadata {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  thumbnailUrl: string;
  duration: string;
  publishedAt: string;
  viewCount?: string;
  likeCount?: string;
}

/* ─── Timeline ─── */

export interface TimelineSegment {
  id: string;
  topic: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  color: string;
}

/* ─── Summary ─── */

export interface Summary {
  overview: string;
  keyPoints: string[];
  segments: TimelineSegment[];
}

/* ─── Claims ─── */

export type ClaimType = "factual" | "opinion" | "prediction";

export type ClaimStatusValue = "supported" | "contested" | "opinion" | "insufficient";

export interface Claim {
  id: string;
  text: string;
  type: ClaimType;
  timestamp?: string;
  confidence: number;
}

export interface FactCheckedClaim extends Claim {
  status: ClaimStatusValue;
  reasoning: string;
  sources: SourceReference[];
}

export interface SourceReference {
  title: string;
  url: string;
  domain: string;
}

/* ─── Analysis ─── */

export type AnalysisStatus = "PENDING" | "PROCESSING" | "COMPLETE" | "FAILED";

export interface Analysis {
  id: string;
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  channelTitle: string;
  thumbnailUrl: string;
  duration: string;
  publishedAt?: string;
  summary: Summary | null;
  claims: FactCheckedClaim[];
  status: AnalysisStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisListItem {
  id: string;
  videoTitle: string;
  thumbnailUrl: string;
  channelTitle: string;
  status: AnalysisStatus;
  claimCount: number;
  createdAt: string;
}

/* ─── API Responses ─── */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AnalyzeRequest {
  url: string;
}

export interface AnalyzeResponse {
  analysisId: string;
  status: AnalysisStatus;
}

/* ─── User ─── */

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  provider: string | null;
}

/* ─── Pricing ─── */

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}

/* ─── Component Props ─── */

export interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export interface VideoInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

export interface SummaryCardProps {
  summary: Summary;
}

export interface ClaimCardProps {
  claim: FactCheckedClaim;
}

export interface TimelineProps {
  segments: TimelineSegment[];
}

export interface SourceBadgeProps {
  source: SourceReference;
}

export interface StatusBadgeProps {
  status: ClaimStatusValue;
}

export interface AnalysisLoaderProps {
  currentStep: number;
}

/* ─── Loading Step ─── */

export interface LoadingStep {
  label: string;
  completed: boolean;
  active: boolean;
}
