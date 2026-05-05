export interface TierConfig {
  name: string;
  maxAnalysesPerMonth: number;
  maxDailyAnalyses: number;
  maxDurationSeconds: number;
  maxClaims: number;
  maxFactChecks: number;
  allLanguages: boolean;
  historyAccess: "none" | "limited" | "unlimited";
  historyDays: number;
}

export const TIERS: Record<string, TierConfig> = {
  free: {
    name: "Observer",
    maxAnalysesPerMonth: 1,
    maxDailyAnalyses: 1,
    maxDurationSeconds: 600, // 10 min
    maxClaims: 5,
    maxFactChecks: 5,
    allLanguages: false,
    historyAccess: "none",
    historyDays: 0,
  },
  analyst: {
    name: "Analyst",
    maxAnalysesPerMonth: 20,
    maxDailyAnalyses: 3,
    maxDurationSeconds: 3600, // 1 hour
    maxClaims: 10,
    maxFactChecks: 10,
    allLanguages: true,
    historyAccess: "limited",
    historyDays: 10,
  },
  veractor: {
    name: "Veractor",
    maxAnalysesPerMonth: 60,
    maxDailyAnalyses: 10,
    maxDurationSeconds: 21600, // 6 hours
    maxClaims: 20,
    maxFactChecks: 20,
    allLanguages: true,
    historyAccess: "unlimited",
    historyDays: Infinity,
  },
};

export function getTierConfig(tier: string): TierConfig {
  return TIERS[tier] ?? TIERS.free;
}

export function parseDurationToSeconds(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

export function formatDurationLimit(seconds: number): string {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    return `${h}h`;
  }
  return `${Math.floor(seconds / 60)}min`;
}
