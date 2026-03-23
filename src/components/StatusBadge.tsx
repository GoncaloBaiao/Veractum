import type { StatusBadgeProps } from "@/types";
import { CheckCircle, AlertTriangle, MessageCircle, HelpCircle } from "lucide-react";
import { CLAIM_STATUS_CONFIG } from "@/lib/utils";

const ICONS = {
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  HelpCircle,
} as const;

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = CLAIM_STATUS_CONFIG[status];
  const Icon = ICONS[config.icon];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.border} ${config.color}`}
      role="status"
      aria-label={`Claim status: ${config.label}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}
