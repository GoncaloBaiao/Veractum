import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Privacy Policy — Veractum" };

export default function PrivacyPage() {
  return (
    <div className="pt-36 pb-28">
      <div className="page-container max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-10">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-gray-100 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: April 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-10 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-3">1. Data We Collect</h2>
            <p>When you sign in to Veractum, we collect your name, email address, and profile picture from your OAuth provider (Google, GitHub, or Twitter/X). We store the YouTube video URLs you submit for analysis and the analysis results generated for your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-3">2. How We Use Your Data</h2>
            <p>Your data is used solely to provide the Veractum service: authenticating your session, running video analyses, and showing you your analysis history. We do not sell, share, or use your data for advertising.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-3">3. Third-Party Services</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li><strong className="text-gray-200">Google OAuth</strong> — used for sign-in. Subject to Google's Privacy Policy.</li>
              <li><strong className="text-gray-200">Neon (PostgreSQL)</strong> — stores user accounts, sessions, and analysis data in the EU region.</li>
              <li><strong className="text-gray-200">Vercel</strong> — hosts the application. Logs contain IP addresses and request metadata for up to 7 days.</li>
              <li><strong className="text-gray-200">Inngest</strong> — processes background analysis jobs. Event payloads contain transcript text.</li>
              <li><strong className="text-gray-200">Google Gemini</strong> — AI model used for summarisation and fact-checking. Prompts include video transcript text.</li>
              <li><strong className="text-gray-200">Supadata</strong> — used to fetch YouTube transcripts by video ID.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-3">4. Data Retention</h2>
            <p>Analysis results are retained for as long as your account is active. Free tier analyses may be deleted after 30 days of inactivity. You can delete your account and all associated data at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-3">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at the email below. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-3">6. Contact</h2>
            <p>For privacy questions or data requests: <a href="mailto:privacy@veractum.app" className="text-amber-400 hover:underline">privacy@veractum.app</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
