import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Cookie Policy — Veractum" };

export default function CookiesPage() {
  return (
    <div className="pt-36 pb-28">
      <div className="page-container max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-10">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-gray-100 mb-2">Cookie Policy</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: April 2026</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-3">What Are Cookies?</h2>
            <p>Cookies are small text files stored on your device by your browser. Veractum uses a minimal set of cookies required for the service to function.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-3">Cookies We Use</h2>
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <p className="font-medium text-gray-100 mb-1">Session Cookie (<code className="text-amber-400 text-xs">next-auth.session-token</code>)</p>
                <p className="text-sm text-gray-400">Stores your authentication session. Required to keep you signed in. Expires when your session ends or after 30 days.</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <p className="font-medium text-gray-100 mb-1">Locale Cookie (<code className="text-amber-400 text-xs">NEXT_LOCALE</code>)</p>
                <p className="text-sm text-gray-400">Remembers your language preference across visits. No personal data stored.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-3">No Tracking Cookies</h2>
            <p>We do not use advertising cookies, cross-site tracking, or third-party marketing cookies. We do not use Google Analytics or similar tracking tools.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-3">Third-Party Cookies</h2>
            <p>Vercel, our hosting provider, may set infrastructure-level cookies for security and performance purposes. These are not used for tracking.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-3">How to Disable Cookies</h2>
            <p>You can disable cookies in your browser settings. Note that disabling session cookies will prevent you from signing in to Veractum. Most browsers allow you to manage cookies per-site in their privacy settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-100 mb-3">Contact</h2>
            <p>Cookie questions: <a href="mailto:privacy@veractum.app" className="text-amber-400 hover:underline">privacy@veractum.app</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
