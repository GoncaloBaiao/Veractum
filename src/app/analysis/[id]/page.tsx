"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, User, ExternalLink, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { SummaryCard } from "@/components/SummaryCard";
import { ClaimCard } from "@/components/ClaimCard";
import { Timeline } from "@/components/Timeline";
import { AnalysisLoader } from "@/components/AnalysisLoader";
import { formatDate, formatDuration } from "@/lib/utils";
import type { Analysis, ApiResponse } from "@/types";

export default function AnalysisPage() {
  const t = useTranslations("analysis");
  const params = useParams();
  const id = params.id as string;

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id === "new") return;

    let cancelled = false;
    let attempt = 0;
    const MAX_WAIT_MS = 10 * 60 * 1000; // 10 minutes
    const startTime = Date.now();

    function getDelay(attempt: number): number {
      if (attempt < 3) return 3000;
      if (attempt < 6) return 5000;
      if (attempt < 9) return 10000;
      return 15000;
    }

    async function fetchAnalysis() {
      if (cancelled) return;

      if (Date.now() - startTime > MAX_WAIT_MS) {
        setError("Analysis is taking too long. Please try again.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/analyze?id=${encodeURIComponent(id)}`);
        const data: ApiResponse<Analysis> = await response.json();

        if (cancelled) return;

        if (!data.success || !data.data) {
          setError(data.error ?? "Analysis not found.");
          setIsLoading(false);
          return;
        }

        const result = data.data;

        if (result.status === "PENDING" || result.status === "PROCESSING") {
          setLoadingStep((prev) => Math.min(prev + 1, 3));
          attempt++;
          setTimeout(fetchAnalysis, getDelay(attempt));
          return;
        }

        if (result.status === "FAILED") {
          const failedSummary = result.summary as unknown as { error?: string } | null;
          setError(failedSummary?.error ?? "Analysis failed. Please try again with a different video.");
          setIsLoading(false);
          return;
        }

        setAnalysis(result);
        setIsLoading(false);
      } catch {
        if (!cancelled) {
          setError("Failed to fetch analysis. Please check your connection.");
          setIsLoading(false);
        }
      }
    }

    fetchAnalysis();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Error state
  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="page-container text-center max-w-lg">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-100 mb-3">{t("somethingWrong")}</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl px-8 py-3 transition-all"
          >
            <ArrowLeft size={16} />
            {t("tryAnother")}
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <AnalysisLoader currentStep={loadingStep} />
      </div>
    );
  }

  if (!analysis) return null;

  const factualClaims = analysis.claims.filter((c) => c.type === "factual");
  const opinionClaims = analysis.claims.filter((c) => c.type === "opinion");
  const supportedCount = analysis.claims.filter((c) => c.status === "supported").length;
  const contestedCount = analysis.claims.filter((c) => c.status === "contested").length;

  return (
    <div className="pt-24 pb-16">
      <div className="page-container max-w-5xl">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          {t("newAnalysis")}
        </Link>

        {/* Video header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-6 mb-10"
        >
          {/* Thumbnail */}
          <div className="relative w-full sm:w-80 aspect-video rounded-2xl overflow-hidden bg-gray-900 shrink-0">
            <Image
              src={analysis.thumbnailUrl}
              alt={analysis.videoTitle}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 320px"
            />
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-mono px-2 py-0.5 rounded">
              {formatDuration(analysis.duration)}
            </div>
          </div>

          {/* Video info */}
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-3 leading-tight">
              {analysis.videoTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <User size={14} />
                {analysis.channelTitle}
              </span>
              {analysis.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatDate(analysis.publishedAt)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {formatDuration(analysis.duration)}
              </span>
            </div>

            {/* Quick stats */}
            <div className="flex gap-4 mt-4">
              <div className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-400">
                <span className="font-bold text-gray-200">{analysis.claims.length}</span> {t("claimsFoundLabel")}
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-400">
                <span className="font-bold">{supportedCount}</span> {t("supportedLabel")}
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-red-500/5 border border-red-500/20 text-xs text-red-400">
                <span className="font-bold">{contestedCount}</span> {t("contestedLabel")}
              </div>
            </div>

            <a
              href={analysis.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              {t("watchOnYouTube")}
              <ExternalLink size={13} />
            </a>
          </div>
        </motion.div>

        {/* Summary */}
        {analysis.summary && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-8"
          >
            <SummaryCard summary={analysis.summary} />
          </motion.div>
        )}

        {/* Timeline */}
        {analysis.summary && analysis.summary.segments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-8"
          >
            <Timeline segments={analysis.summary.segments} />
          </motion.div>
        )}

        {/* Claims */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {factualClaims.length > 0 && (
            <section aria-labelledby="factual-claims-heading" className="mb-8">
              <h2 id="factual-claims-heading" className="text-xl font-bold text-gray-100 mb-5">
                {t("factualClaims", { count: factualClaims.length })}
              </h2>
              <div className="space-y-4">
                {factualClaims.map((claim) => (
                  <ClaimCard key={claim.id} claim={claim} />
                ))}
              </div>
            </section>
          )}

          {opinionClaims.length > 0 && (
            <section aria-labelledby="opinion-claims-heading">
              <h2 id="opinion-claims-heading" className="text-xl font-bold text-gray-100 mb-5">
                {t("opinionsClaims", { count: opinionClaims.length })}
              </h2>
              <div className="space-y-4">
                {opinionClaims.map((claim) => (
                  <ClaimCard key={claim.id} claim={claim} />
                ))}
              </div>
            </section>
          )}
        </motion.div>
      </div>
    </div>
  );
}
