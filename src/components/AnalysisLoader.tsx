"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AnalysisLoaderProps } from "@/types";

const STEP_CLIPS = [
  "/clip1.mp4",
  "/clip2.mp4",
  "/clip3.mp4",
  "/clip4.mp4",
];

export function AnalysisLoader({ currentStep }: AnalysisLoaderProps) {
  const t = useTranslations("analysisLoader");
  const steps = [t("step1"), t("step2"), t("step3"), t("step4")];

  // Show the current step clip, or last clip if all done
  const clipIndex = Math.min(currentStep, STEP_CLIPS.length - 1);
  const clipSrc = STEP_CLIPS[clipIndex];

  return (
    <div className="w-full max-w-md mx-auto py-10">
      {/* Video clip */}
      <div className="w-full flex justify-center items-center mb-8 rounded-2xl overflow-hidden bg-gray-900" style={{ height: "280px" }}>
        <video
          key={clipSrc}
          src={clipSrc}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain"
        />
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
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-amber-400"
                    />
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
