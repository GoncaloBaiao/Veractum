"use client";

import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="page-container text-center">
        <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-8">
          <SearchX size={36} className="text-amber-400" />
        </div>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-gray-100 mb-4">
          {t("title")}
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          {t("message")}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl px-8 py-3.5 transition-all hover:shadow-lg hover:shadow-amber-500/25"
        >
          <ArrowLeft size={18} />
          {t("backHome")}
        </Link>
      </div>
    </div>
  );
}
