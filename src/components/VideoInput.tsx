"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, AlertCircle } from "lucide-react";
import type { VideoInputProps } from "@/types";
import { isValidYouTubeUrl } from "@/lib/utils";

export function VideoInput({ onSubmit, isLoading = false }: VideoInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      const trimmed = url.trim();
      if (!trimmed) {
        setError("Please enter a YouTube URL.");
        return;
      }

      if (!isValidYouTubeUrl(trimmed)) {
        setError("Invalid YouTube URL. Please use a youtube.com/watch or youtu.be link.");
        return;
      }

      onSubmit(trimmed);
    },
    [url, onSubmit]
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`relative flex items-center rounded-2xl border-2 transition-all duration-300 bg-gray-900/80 backdrop-blur-sm ${
            error
              ? "border-red-500/50"
              : isFocused
                ? "border-amber-500/50 shadow-lg shadow-amber-500/10"
                : "border-gray-800 hover:border-gray-700"
          }`}
        >
          <Search
            size={20}
            className={`absolute left-5 transition-colors ${
              isFocused ? "text-amber-400" : "text-gray-500"
            }`}
            aria-hidden="true"
          />
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Paste a YouTube link…"
            disabled={isLoading}
            className="w-full bg-transparent text-gray-100 placeholder-gray-500 pl-14 pr-36 py-5 rounded-2xl focus:outline-none text-base sm:text-lg"
            aria-label="YouTube video URL"
            aria-describedby="url-help"
            autoComplete="url"
          />
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="absolute right-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold rounded-xl px-6 py-3 text-sm transition-all hover:shadow-lg hover:shadow-amber-500/25 disabled:shadow-none disabled:cursor-not-allowed"
            aria-label="Analyse video"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "Analyse"
            )}
          </button>
        </div>
      </form>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 mt-3 text-red-400 text-sm"
            role="alert"
          >
            <AlertCircle size={14} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <p id="url-help" className="mt-3 text-center text-xs text-gray-600">
        Supports youtube.com/watch?v= and youtu.be/ links
      </p>
    </div>
  );
}
