"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { BrandLogo } from "@/components/BrandLogo";

export function Footer() {
  const t = useTranslations("footer");

  const footerLinks = {
    [t("product")]: [
      { label: t("howItWorks"), href: "/#how-it-works" },
      { label: t("pricing"), href: "/pricing" },
      { label: t("exampleAnalysis"), href: "/#demo" },
      { label: t("donate"), href: "/donate" },
    ],
    [t("resources")]: [
      { label: t("documentation"), href: "#" },
      { label: t("apiReference"), href: "#" },
      { label: t("changelog"), href: "#" },
    ],
    [t("legal")]: [
      { label: t("privacyPolicy"), href: "#" },
      { label: t("termsOfService"), href: "#" },
      { label: t("cookiePolicy"), href: "#" },
    ],
  };

  return (
    <footer className="border-t border-gray-800/50 bg-[#0a0a0f] mt-auto">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <BrandLogo size="sm" />
              <span className="text-lg font-bold tracking-tight">Veractum</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-[200px]">
              <span className="block">{t("tagline")}</span>
              <span className="block mt-2 text-gray-600">{t("description")}</span>
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
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
        <div className="mt-16 pt-8 border-t border-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-xs text-gray-600">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="text-xs text-gray-600">
            {t("etymology", { verus: "verus", factum: "factum" })}
          </p>
        </div>
      </div>
    </footer>
  );
}
