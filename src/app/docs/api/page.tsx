import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "API Reference — Veractum" };

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="text-xs bg-gray-800 text-amber-300 px-1.5 py-0.5 rounded">{children}</code>
);

const Pre = ({ children }: { children: string }) => (
  <pre className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-xs text-gray-300 overflow-x-auto whitespace-pre">{children}</pre>
);

export default function ApiDocsPage() {
  return (
    <div className="pt-36 pb-28">
      <div className="page-container max-w-3xl mx-auto">
        <Link href="/docs" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-10">
          <ArrowLeft size={16} /> Documentation
        </Link>

        <h1 className="text-4xl font-bold text-gray-100 mb-2">API Reference</h1>
        <p className="text-gray-500 mb-12">Internal REST API used by the Veractum frontend.</p>

        {/* Rate Limits */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-100 mb-4 pb-2 border-b border-gray-800">Rate Limits</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-left">
                  <th className="py-2 pr-6">Tier</th>
                  <th className="py-2 pr-6">Analyses / month</th>
                  <th className="py-2 pr-6">Max video length</th>
                  <th className="py-2">Claims per analysis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {[
                  ["Observer (free)", "2", "10 min", "5"],
                  ["Analyst", "30", "1 hour", "10"],
                  ["Veractor", "Unlimited", "6 hours", "20"],
                ].map(([tier, ...cols]) => (
                  <tr key={tier}>
                    <td className="py-3 pr-6 text-gray-200">{tier}</td>
                    {cols.map((c, i) => <td key={i} className="py-3 pr-6 text-gray-400">{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* POST /api/analyze */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-100 mb-4 pb-2 border-b border-gray-800">POST /api/analyze</h2>
          <p className="text-gray-400 mb-4">Start a new analysis for a YouTube video. Requires authentication.</p>

          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Request Body</h3>
          <Pre>{`{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "locale": "pt"   // optional, defaults to "en"
}`}</Pre>

          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2">Success Response <Code>202</Code></h3>
          <Pre>{`{
  "success": true,
  "data": {
    "analysisId": "cmo...",
    "status": "PROCESSING"
  }
}`}</Pre>

          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2">Error Responses</h3>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3"><Code>401</Code><span className="text-gray-400">Not authenticated</span></div>
            <div className="flex gap-3"><Code>402</Code><span className="text-gray-400">Monthly quota exceeded</span></div>
            <div className="flex gap-3"><Code>422</Code><span className="text-gray-400">No captions available or transcript too short</span></div>
            <div className="flex gap-3"><Code>503</Code><span className="text-gray-400">Database unavailable</span></div>
          </div>
        </section>

        {/* GET /api/analyze */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-100 mb-4 pb-2 border-b border-gray-800">GET /api/analyze</h2>
          <p className="text-gray-400 mb-4">Poll the status of an analysis. Used by the results page to detect completion.</p>

          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Query Parameters</h3>
          <Pre>{`GET /api/analyze?id=cmo...`}</Pre>

          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2">Response when PROCESSING <Code>200</Code></h3>
          <Pre>{`{
  "success": true,
  "data": {
    "id": "cmo...",
    "status": "PROCESSING",
    "claims": []
  }
}`}</Pre>

          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2">Response when COMPLETE <Code>200</Code></h3>
          <Pre>{`{
  "success": true,
  "data": {
    "id": "cmo...",
    "status": "COMPLETE",
    "videoTitle": "...",
    "summary": { "overview": "...", "keyPoints": [...], "segments": [...] },
    "claims": [
      {
        "id": "...",
        "text": "The claim text",
        "type": "FACTUAL",
        "status": "SUPPORTED",
        "confidence": 85,
        "reasoning": "...",
        "sources": [{ "title": "...", "url": "...", "domain": "..." }],
        "timestamp": "3:45"
      }
    ]
  }
}`}</Pre>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-100 mb-4 pb-2 border-b border-gray-800">Authentication</h2>
          <p className="text-gray-400">All endpoints require a valid NextAuth session cookie. Sign in via <Code>/api/auth/signin</Code> using Google, GitHub, or Twitter. The session token is set automatically as an HTTP-only cookie.</p>
        </section>
      </div>
    </div>
  );
}
