import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Terms of Service — Veractum" };

export default function TermsPage() {
  return (
    <div className="pt-36 pb-28">
      <div className="page-container max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-10">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-gray-100 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: April 2026</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-3">1. Acceptance</h2>
            <p>By accessing or using Veractum, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-3">2. Service Description</h2>
            <p>Veractum is an AI-powered tool that analyses YouTube videos by fetching transcripts, generating summaries, and fact-checking claims using AI models and public data sources. Results are provided for informational purposes only and should not be considered definitive fact-checking.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-3">3. Free Tier Limitations</h2>
            <p>Free (Observer) accounts are limited to 2 analyses per month, videos up to 10 minutes, and 5 claims per analysis. These limits may change without notice. Exceeding limits will result in an error response.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-3">4. Prohibited Use</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Automating requests beyond the documented API rate limits</li>
              <li>Using the service to generate or spread misinformation</li>
              <li>Attempting to reverse-engineer, scrape, or abuse the service</li>
              <li>Submitting videos containing illegal content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-3">5. Disclaimer of Warranties</h2>
            <p>Veractum is provided "as is" without warranties of any kind. AI-generated analysis may contain errors. We do not guarantee the accuracy, completeness, or reliability of any analysis results.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-3">6. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Veractum and its operators shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-3">7. Contact</h2>
            <p>Questions about these terms: <a href="mailto:legal@veractum.app" className="text-amber-400 hover:underline">legal@veractum.app</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
