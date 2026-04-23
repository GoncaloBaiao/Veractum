import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const metadata = { title: "Documentation — Veractum" };

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="mb-12">
    <h2 className="text-2xl font-bold text-gray-100 mb-4 pb-2 border-b border-gray-800">{title}</h2>
    <div className="space-y-4 text-gray-300 leading-relaxed">{children}</div>
  </section>
);

export default function DocsPage() {
  return (
    <div className="pt-36 pb-28">
      <div className="page-container max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-10">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-100 mb-2">Documentation</h1>
            <p className="text-gray-500">Everything you need to understand and use Veractum.</p>
          </div>
          <Link href="/docs/api" className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors">
            API Reference <ArrowRight size={14} />
          </Link>
        </div>

        <Section id="getting-started" title="Getting Started">
          <p>Veractum analyses YouTube videos in three steps:</p>
          <ol className="list-decimal list-inside space-y-2 text-gray-400">
            <li>Paste a YouTube URL into the input on the homepage</li>
            <li>Sign in with Google, GitHub, or Twitter if prompted</li>
            <li>Wait 1–3 minutes while the AI processes the video</li>
          </ol>
          <p>The video must have captions or auto-generated subtitles enabled on YouTube. Videos without any subtitles cannot be analysed.</p>
        </Section>

        <Section id="how-it-works" title="How Analysis Works">
          <p>When you submit a video URL, Veractum:</p>
          <ol className="list-decimal list-inside space-y-2 text-gray-400">
            <li><strong className="text-gray-200">Fetches the transcript</strong> via the Supadata API, which retrieves YouTube captions including auto-generated ones</li>
            <li><strong className="text-gray-200">Generates a summary</strong> using Gemini 2.5 Flash — key points, topic segments with timestamps, and an overview</li>
            <li><strong className="text-gray-200">Extracts claims</strong> — factual statements, opinions, and predictions identified in the transcript</li>
            <li><strong className="text-gray-200">Fact-checks each claim</strong> — Gemini searches its knowledge and (when configured) the web to assign a verdict and confidence score</li>
          </ol>
          <p>Processing runs as a background job via Inngest with no time limit, so long videos are fully supported.</p>
        </Section>

        <Section id="understanding-results" title="Understanding Results">
          <div className="space-y-4">
            {[
              { label: "Supported", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", desc: "The claim is backed by credible evidence. Confidence is typically 70–100%." },
              { label: "Contested", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", desc: "Evidence contradicts or raises significant doubt about the claim. Confidence is 30–70%." },
              { label: "Opinion", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", desc: "The statement is subjective and cannot be objectively verified." },
              { label: "Insufficient Data", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", desc: "Not enough evidence was found to reach a verdict." },
            ].map(item => (
              <div key={item.label} className={`rounded-xl p-4 border ${item.bg}`}>
                <p className={`font-semibold ${item.color} mb-1`}>{item.label}</p>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">The confidence score (0–100%) reflects the AI&apos;s certainty in its verdict. Always use results as a starting point, not a final answer.</p>
        </Section>

        <Section id="faq" title="FAQ">
          {[
            { q: "Why does my video fail with 'no captions available'?", a: "The video must have either manual captions or auto-generated subtitles enabled by the creator. Live streams and some private videos are not supported." },
            { q: "How long does analysis take?", a: "Typically 1–3 minutes, depending on video length and current server load. The Inngest background job has no hard timeout." },
            { q: "Can I analyse the same video twice?", a: "Yes. Each analysis request creates a new independent analysis and counts toward your monthly quota." },
            { q: "Why is the timeline only showing the first part of a long video?", a: "Veractum samples the transcript evenly across the full video duration to generate distributed timeline segments and claims." },
          ].map(({ q, a }) => (
            <div key={q} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="font-medium text-gray-100 mb-2">{q}</p>
              <p className="text-sm text-gray-400">{a}</p>
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
}
