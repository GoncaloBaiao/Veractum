"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, FileCheck, Loader2, LogIn } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/utils";
import type { AnalysisListItem, ApiResponse } from "@/types";

export default function HistoryPage() {
  const t = useTranslations("history");
  const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch("/api/analyze?history=true");
        const data: ApiResponse<AnalysisListItem[]> = await response.json();

        if (response.status === 401) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);

        if (data.success && data.data) {
          setAnalyses(data.data);
        }
      } catch {
        // Silently handle — show empty state
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, []);

  // Not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="page-container text-center max-w-lg">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <LogIn size={28} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-100 mb-3">{t("signInTitle")}</h1>
          <p className="text-gray-400 mb-8">
            {t("signInDesc")}
          </p>
          <Link
            href="/api/auth/signin"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl px-8 py-3 transition-all"
          >
            {t("signIn")}
          </Link>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 size={32} className="text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="page-container max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          {t("home")}
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-100 mb-2">
          {t("title")}
        </h1>
        <p className="text-gray-400 mb-10">
          {t("subtitle")}
        </p>

        {analyses.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto mb-6">
              <FileCheck size={24} className="text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-300 mb-2">{t("noAnalyses")}</h2>
            <p className="text-gray-500 mb-6">
              {t("noAnalysesDesc")}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl px-6 py-3 text-sm transition-all"
            >
              {t("analyseVideo")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyses.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  href={`/analysis/${item.id}`}
                  className="block bg-gray-900 border-2 border-gray-800 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 group"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gray-800">
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.videoTitle}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                    {/* Status badge */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          item.status === "COMPLETE"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : item.status === "FAILED"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {item.status.toLowerCase()}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-200 leading-snug mb-2 line-clamp-2">
                      {item.videoTitle}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{item.channelTitle}</span>
                      <div className="flex items-center gap-1.5">
                        <Clock size={11} />
                        {formatDate(item.createdAt)}
                      </div>
                    </div>
                    {item.claimCount > 0 && (
                      <p className="text-xs text-amber-400/60 mt-2">
                        {t("claimsAnalysed", { count: item.claimCount })}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
