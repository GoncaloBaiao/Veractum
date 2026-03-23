"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Clock } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { SourceBadge } from "@/components/SourceBadge";
import type { ClaimCardProps } from "@/types";

export function ClaimCard({ claim }: ClaimCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.article
      layout
      className="bg-gray-900 border-2 border-gray-800 rounded-2xl p-5 sm:p-6 hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-label={`Claim: ${claim.text}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <StatusBadge status={claim.status} />
        {claim.timestamp && (
          <span className="flex items-center gap-1 text-xs text-gray-500 font-mono shrink-0">
            <Clock size={12} />
            {claim.timestamp}
          </span>
        )}
      </div>

      {/* Claim text */}
      <p className="text-gray-200 leading-relaxed mb-4 text-base">
        &ldquo;{claim.text}&rdquo;
      </p>

      {/* Confidence bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500">Confidence</span>
          <span className="text-xs font-mono text-gray-400">{claim.confidence}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${claim.confidence}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className={`h-full rounded-full ${
              claim.confidence >= 70
                ? "bg-emerald-500"
                : claim.confidence >= 40
                  ? "bg-amber-500"
                  : "bg-red-500"
            }`}
          />
        </div>
      </div>

      {/* Sources */}
      {claim.sources.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {claim.sources.map((source, idx) => (
            <SourceBadge key={idx} source={source} />
          ))}
        </div>
      )}

      {/* Expand toggle */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
        />
        <span>{isExpanded ? "Hide reasoning" : "Show reasoning"}</span>
      </div>

      {/* Expanded reasoning */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-4 pt-4 border-t border-gray-800"
        >
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            AI Reasoning
          </h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            {claim.reasoning}
          </p>
        </motion.div>
      )}
    </motion.article>
  );
}
