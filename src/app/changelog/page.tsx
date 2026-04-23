import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Changelog — Veractum" };

const changes = [
  {
    version: "v1.3.0",
    date: "April 2026",
    tag: "Feature",
    tagColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    items: [
      "UX/UI overhaul: Spline 3D loading animation replaces spinner",
      "Tier badge now visible in navbar next to user avatar",
      "Donate section added to landing page with custom PayPal amount",
      "Footer redesigned with amber top glow and real page links",
      "Privacy, Terms, Cookies, Docs, API Reference, and Changelog pages added",
      "Loading time text updated to reflect accurate 1–3 minute estimate",
    ],
  },
  {
    version: "v1.2.0",
    date: "April 2026",
    tag: "Infrastructure",
    tagColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    items: [
      "Migrated processAnalysis to Inngest background jobs — no more 60s Vercel timeout",
      "Transcript now evenly sampled across full video for accurate full-duration timeline",
      "Video duration passed through pipeline for timestamp-annotated transcript chunks",
      "Fallback to text=true transcript mode for auto-generated captions (fixes 206 partial)",
      "Locale-aware error messages for insufficient data in fact-check results",
      "Prisma connection pool settings tuned (connection_limit=10, pool_timeout=30)",
    ],
  },
  {
    version: "v1.1.0",
    date: "March 2026",
    tag: "Feature",
    tagColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    items: [
      "Tier system: Observer (free), Analyst, and Veractor plans",
      "Tier limits: 2 / 30 / unlimited analyses per month",
      "Claim limits: 5 / 10 / 20 claims per analysis per tier",
      "Exponential backoff polling on results page (3s→5s→10s→15s, 10 min timeout)",
      "Session refetch interval set to 5 minutes to reduce /api/auth/session spam",
      "Supadata API replacing InnerTube for transcript fetching (Vercel IP bypass)",
    ],
  },
  {
    version: "v1.0.0",
    date: "February 2026",
    tag: "Launch",
    tagColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    items: [
      "Initial public launch",
      "YouTube transcript extraction and AI-powered summary",
      "Claim extraction and fact-checking with Gemini 2.5 Flash",
      "Visual topic timeline with colour-coded segments",
      "Multi-language support for 9 locales",
      "Google, GitHub, and Twitter OAuth sign-in",
      "Analysis history for authenticated users",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="pt-36 pb-28">
      <div className="page-container max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-10">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-gray-100 mb-2">Changelog</h1>
        <p className="text-gray-500 mb-16">A history of updates and improvements to Veractum.</p>

        <div className="space-y-12">
          {changes.map((release) => (
            <div key={release.version} className="relative pl-6 border-l border-gray-800">
              <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-amber-500/50 border-2 border-amber-500" />
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="text-xl font-bold text-gray-100">{release.version}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${release.tagColor}`}>
                  {release.tag}
                </span>
                <span className="text-sm text-gray-500">{release.date}</span>
              </div>
              <ul className="space-y-2">
                {release.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="text-amber-500 mt-1.5 shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
