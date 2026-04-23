"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AnalysisLoaderProps } from "@/types";

function PulsingOrb() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
      {/* Outer rings */}
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className="absolute rounded-full border border-amber-500/20 animate-ping"
          style={{
            width: 60 + i * 40,
            height: 60 + i * 40,
            animationDelay: `${i * 0.4}s`,
            animationDuration: "2.4s",
          }}
        />
      ))}
      {/* Core */}
      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/40 flex items-center justify-center">
        <Loader2 size={28} className="text-black animate-spin" />
      </div>
    </div>
  );
}

export function AnalysisLoader({ currentStep }: AnalysisLoaderProps) {
  const t = useTranslations("analysisLoader");
  const steps = [t("step1"), t("step2"), t("step3"), t("step4")];
  return (
    <div className="w-full max-w-md mx-auto py-10">
      {/* Animated orb */}
      <div className="w-full flex justify-center items-center mb-8" style={{ height: "200px" }}>
        <PulsingOrb />
      </div>

      {/* Steps */}
      <div className="space-y-4" role="status" aria-live="polite">
        {steps.map((label, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15, duration: 0.3 }}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-xl border transition-all duration-300 ${
                isCompleted
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : isActive
                    ? "bg-amber-500/5 border-amber-500/30"
                    : "bg-gray-900/50 border-gray-800"
              }`}
            >
              {/* Step indicator */}
              <div className="shrink-0">
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center"
                  >
                    <Check size={14} className="text-emerald-400" />
                  </motion.div>
                ) : isActive ? (
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Loader2 size={14} className="text-amber-400 animate-spin" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center">
                    <span className="text-xs text-gray-600 font-mono">{index + 1}</span>
                  </div>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-sm font-medium transition-colors ${
                  isCompleted
                    ? "text-emerald-400"
                    : isActive
                      ? "text-amber-400"
                      : "text-gray-600"
                }`}
              >
                {label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Subtext */}
      <p className="mt-8 text-center text-xs text-gray-600">
        {t("note")}
      </p>
    </div>
  );
}
