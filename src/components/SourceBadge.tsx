import { ExternalLink } from "lucide-react";
import type { SourceBadgeProps } from "@/types";

export function SourceBadge({ source }: SourceBadgeProps) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700 text-xs text-gray-400 hover:text-amber-400 hover:border-amber-500/30 transition-all group"
      aria-label={`Source: ${source.title} on ${source.domain}`}
    >
      <span className="truncate max-w-[180px]">{source.title}</span>
      <ExternalLink
        size={10}
        className="shrink-0 text-gray-600 group-hover:text-amber-400 transition-colors"
      />
    </a>
  );
}
