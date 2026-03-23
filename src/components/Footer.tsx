import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

const FOOTER_LINKS = {
  Product: [
    { label: "How it Works", href: "/#how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "Example Analysis", href: "/#demo" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Changelog", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
} as const;

export function Footer() {
  return (
    <footer className="border-t border-gray-800/50 bg-[#0a0a0f]">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <BrandLogo size="sm" />
              <span className="text-lg font-bold tracking-tight">Veractum</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              See clearly. Think freely.
              <br />
              AI-powered video analysis and fact-checking.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-300 mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-gray-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Veractum. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            From Latin <em>verus</em> (true) + <em>factum</em> (deed) — the truth of what was said.
          </p>
        </div>
      </div>
    </footer>
  );
}
