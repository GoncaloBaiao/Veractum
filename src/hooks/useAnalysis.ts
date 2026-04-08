"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import type { AnalysisStatus, ApiResponse, AnalyzeResponse } from "@/types";

interface UseAnalysisReturn {
  isLoading: boolean;
  error: string | null;
  status: AnalysisStatus | null;
  submit: (url: string) => Promise<void>;
  reset: () => void;
}

export function useAnalysis(): UseAnalysisReturn {
  const router = useRouter();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisStatus | null>(null);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setStatus(null);
  }, []);

  const submit = useCallback(
    async (url: string) => {
      setIsLoading(true);
      setError(null);
      setStatus("PENDING");

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, locale }),
        });

        const data: ApiResponse<AnalyzeResponse> = await response.json();

        if (!response.ok || !data.success || !data.data) {
          setError(data.error ?? "Failed to start analysis.");
          setStatus("FAILED");
          setIsLoading(false);
          return;
        }

        setStatus("PROCESSING");
        router.push(`/analysis/${data.data.analysisId}`);
      } catch {
        setError("Network error. Please check your connection and try again.");
        setStatus("FAILED");
        setIsLoading(false);
      }
    },
    [router, locale]
  );

  return { isLoading, error, status, submit, reset };
}
