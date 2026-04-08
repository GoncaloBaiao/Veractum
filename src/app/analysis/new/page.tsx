"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnalysisLoader } from "@/components/AnalysisLoader";
import type { ApiResponse, AnalyzeResponse } from "@/types";

function NewAnalysisContent() {
  const t = useTranslations("analysis");
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get("url");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      router.replace("/");
      return;
    }

    let cancelled = false;

    async function startAnalysis() {
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        const data: ApiResponse<AnalyzeResponse> = await response.json();

        if (cancelled) return;

        if (!data.success || !data.data) {
          setError(data.error ?? "Failed to start analysis.");
          return;
        }

        router.replace(`/analysis/${data.data.analysisId}`);
      } catch {
        if (!cancelled) {
          setError("Failed to connect to the server. Please try again.");
        }
      }
    }

    startAnalysis();

    return () => {
      cancelled = true;
    };
  }, [url, router]);

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

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <AnalysisLoader currentStep={0} />
    </div>
  );
}

export default function NewAnalysisPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <AnalysisLoader currentStep={0} />
        </div>
      }
    >
      <NewAnalysisContent />
    </Suspense>
  );
}
