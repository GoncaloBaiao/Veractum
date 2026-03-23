"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import type { TimelineProps } from "@/types";

export function Timeline({ segments }: TimelineProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalDuration = segments.reduce((sum, seg) => sum + seg.durationSeconds, 0);

  if (segments.length === 0 || totalDuration === 0) {
    return null;
  }

  return (
    <section
      className="bg-gray-900 border-2 border-gray-800 rounded-2xl p-6 sm:p-8"
      aria-labelledby="timeline-heading"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Clock size={20} className="text-amber-400" />
        </div>
        <h2 id="timeline-heading" className="text-xl font-bold text-gray-100">
          Topic Timeline
        </h2>
      </div>

      {/* Timeline bar */}
      <div className="relative mb-8">
        <div
          className="flex h-10 rounded-xl overflow-hidden bg-gray-800 gap-0.5"
          role="img"
          aria-label="Video topic timeline"
        >
          {segments.map((segment, index) => {
            const widthPercent = (segment.durationSeconds / totalDuration) * 100;

            return (
              <motion.div
                key={segment.id}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: segment.color,
                  originX: 0,
                }}
                className="relative h-full cursor-pointer transition-opacity"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                role="button"
                tabIndex={0}
                aria-label={`${segment.topic}: ${segment.startTime} - ${segment.endTime}`}
              >
                {/* Tooltip */}
                {hoveredIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 pointer-events-none"
                  >
                    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                      <p className="text-xs font-semibold text-gray-100">{segment.topic}</p>
                      <p className="text-xs text-gray-400 font-mono">
                        {segment.startTime} – {segment.endTime}
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-gray-800 border-r border-b border-gray-700 rotate-45 mx-auto -mt-1" />
                  </motion.div>
                )}

                {/* Highlight on hover */}
                {hoveredIndex === index && (
                  <div className="absolute inset-0 bg-white/10 rounded" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {segments.map((segment) => (
          <div key={segment.id} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-xs text-gray-400 truncate max-w-[150px]">
              {segment.topic}
            </span>
            <span className="text-xs text-gray-600 font-mono">
              {segment.startTime}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
