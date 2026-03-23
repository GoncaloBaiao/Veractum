import { FileText } from "lucide-react";
import type { SummaryCardProps } from "@/types";

export function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <section
      className="bg-gray-900 border-2 border-gray-800 rounded-2xl p-6 sm:p-8"
      aria-labelledby="summary-heading"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <FileText size={20} className="text-amber-400" />
        </div>
        <h2 id="summary-heading" className="text-xl font-bold text-gray-100">
          Summary
        </h2>
      </div>

      <p className="text-gray-300 leading-relaxed mb-6">
        {summary.overview}
      </p>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Key Points
        </h3>
        <ul className="space-y-3" role="list">
          {summary.keyPoints.map((point, index) => (
            <li key={index} className="flex gap-3 items-start">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span className="text-gray-300 leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
