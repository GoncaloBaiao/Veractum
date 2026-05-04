"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="bg-gray-950 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-lg px-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-100 mb-3">Something went wrong</h2>
          <p className="text-gray-400 mb-8">A critical error occurred. Please refresh the page.</p>
          <button
            onClick={reset}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-all"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
