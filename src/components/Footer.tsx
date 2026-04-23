"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { BrandLogo } from "@/components/BrandLogo";
import { Heart } from "lucide-react";

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
      { label: t("documentation"), href: "/docs" },
      { label: t("apiReference"), href: "/docs/api" },
      { label: t("changelog"), href: "/changelog" },
    ],
    [t("legal")]: [
      { label: t("privacyPolicy"), href: "/privacy" },
      { label: t("termsOfService"), href: "/terms" },
      { label: t("cookiePolicy"), href: "/cookies" },
    ],
  };

  return (
    <footer className="border-t border-gray-800/50 bg-[#0a0a0f] mt-auto relative">
      {/* Amber top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      <div className="page-container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <BrandLogo size="sm" />
              <span className="text-lg font-bold tracking-tight text-gray-100">Veractum</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-2">
              {t("tagline")}
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              {t("description")}
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">{category}</h3>
              <ul className="space-y-3.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-gray-500 hover:text-amber-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="text-xs text-gray-600 flex items-center gap-1.5">
            Feito com <Heart size={11} className="text-amber-500 fill-amber-500" /> em Portugal
          </p>
          <p className="text-xs text-gray-700 italic">
            {t("etymology", { verus: "verus", factum: "factum" })}
          </p>
        </div>
      </div>
    </footer>
  );
}
