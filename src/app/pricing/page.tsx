"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Check, X as XIcon, ArrowRight, Sparkles, ChevronDown, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const FEATURE_ROWS = [
  "analysesPerMonth",
  "maxDuration",
  "claimsPerAnalysis",
  "allLanguages",
  "analysisHistory",
  "priorityProcessing",
  "aiModelChoice",
] as const;

export default function PricingPage() {
  return (
    <Suspense>
      <PricingContent />
    </Suspense>
  );
}

function PricingContent() {
  const t = useTranslations("pricing");
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "info"; message: string } | null>(null);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setToast({ type: "success", message: "Subscrição activada! Bem-vindo." });
      router.replace("/pricing");
    } else if (searchParams.get("cancelled") === "true") {
      setToast({ type: "info", message: "Pagamento cancelado." });
      router.replace("/pricing");
    }
  }, [searchParams, router]);

  const handleCheckout = async (tier: "analyst" | "veractor") => {
    if (!session) {
      router.push("/?login=true");
      return;
    }
    setLoadingTier(tier);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: tier }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingTier(null);
    }
  };

  const tiers = [
    {
      key: "observer",
      name: t("observer"),
      price: t("observerPrice"),
      period: t("observerPeriod"),
      description: t("observerDesc"),
      features: [t("observerF1"), t("observerF2"), t("observerF3"), t("observerF4"), t("observerF5")],
      comparison: {
        analysesPerMonth: "1",
        maxDuration: "10 min",
        claimsPerAnalysis: "5",
        allLanguages: false,
        analysisHistory: false,
        priorityProcessing: false,
        aiModelChoice: false,
      },
      highlighted: false,
      cta: t("observerCTA"),
    },
    {
      key: "analyst",
      name: t("analyst"),
      price: t("analystPrice"),
      period: t("analystPeriod"),
      description: t("analystDesc"),
      features: [t("analystF1"), t("analystF2"), t("analystF3"), t("analystF4"), t("analystF5"), t("analystF6"), t("analystF7")],
      comparison: {
        analysesPerMonth: "20",
        maxDuration: "1h",
        claimsPerAnalysis: "10",
        allLanguages: true,
        analysisHistory: "10 dias",
        priorityProcessing: false,
        aiModelChoice: false,
      },
      highlighted: true,
      cta: t("analystCTA"),
    },
    {
      key: "veractor",
      name: t("veractor"),
      price: t("veractorPrice"),
      period: t("veractorPeriod"),
      description: t("veractorDesc"),
      features: [t("veractorF1"), t("veractorF2"), t("veractorF3"), t("veractorF4"), t("veractorF5"), t("veractorF6"), t("veractorF7"), t("veractorF8")],
      comparison: {
        analysesPerMonth: "60",
        maxDuration: "6h",
        claimsPerAnalysis: "20",
        allLanguages: true,
        analysisHistory: t("unlimited"),
        priorityProcessing: true,
        aiModelChoice: "soon" as const,
      },
      highlighted: false,
      cta: t("veractorCTA"),
    },
  ];

  const faqs = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
    { q: t("faq4Q"), a: t("faq4A") },
  ];

  return (
    <div className="pt-36 pb-28">
      <div className="page-container">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl font-semibold text-sm shadow-xl border ${
            toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-blue-500/10 border-blue-500/30 text-blue-300"
          }`}>
            {toast.message}
            <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100">&times;</button>
          </div>
        )}
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <span className="text-label mb-3 inline-block">{t("label")}</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-100 mb-6">
            {t("title")} <span className="gradient-text">{t("highlight")}</span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-400 leading-relaxed text-base sm:text-lg">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 lg:gap-9 max-w-6xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.key}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col bg-gray-900 rounded-2xl p-8 lg:p-9 transition-all duration-300 ${
                tier.highlighted
                  ? "border-2 border-amber-500/50 shadow-lg shadow-amber-500/10 scale-[1.02]"
                  : "border-2 border-gray-800 hover:border-amber-500/30"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500 text-black text-xs font-bold">
                    <Sparkles size={12} />
                    {t("mostPopular")}
                  </span>
                </div>
              )}

              <h2 className="text-lg font-bold text-gray-100 mb-2">{tier.name}</h2>
              <p className="text-sm text-gray-500 mb-6">{tier.description}</p>

              <div className="mb-8">
                <span className="text-4xl font-black text-gray-100">{tier.price}</span>
                <span className="text-gray-500 ml-2 text-sm">/ {tier.period}</span>
              </div>

              <ul className="space-y-3.5 mb-9 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      size={16}
                      className={`mt-0.5 shrink-0 ${
                        tier.highlighted ? "text-amber-400" : "text-gray-600"
                      }`}
                    />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  if (tier.key === "analyst" || tier.key === "veractor") {
                    void handleCheckout(tier.key as "analyst" | "veractor");
                  }
                }}
                disabled={loadingTier === tier.key}
                className={`w-full flex items-center justify-center gap-2 font-bold rounded-xl px-6 py-3.5 text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                  tier.highlighted
                    ? "bg-amber-500 hover:bg-amber-600 text-black hover:shadow-lg hover:shadow-amber-500/25"
                    : "border-2 border-gray-700 hover:border-amber-400 text-gray-300 hover:text-white"
                }`}
              >
                {loadingTier === tier.key ? (
                  <><Loader2 size={16} className="animate-spin" /> A redirecionar...</>
                ) : (
                  <>{tier.cta}{tier.key !== "observer" && <ArrowRight size={16} />}</>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon — AI Model Choice */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-10 max-w-6xl mx-auto"
        >
          <div className="relative rounded-2xl border border-amber-500/20 bg-gray-900/50 backdrop-blur-sm px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-600/10 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Sparkles size={20} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {t("comingSoonLabel")}
                </span>
              </div>
              <p className="text-sm text-gray-300 font-medium">
                {t("aiModelChoiceTitle")}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {t("aiModelChoiceDesc")}
              </p>
            </div>
            <span className="shrink-0 px-3 py-1 rounded-full border border-amber-500/30 text-amber-400 text-xs font-medium">
              Veractor
            </span>
          </div>
        </motion.div>

        {/* Feature comparison table */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-gray-100 text-center mb-8">{t("compareTitle")}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 pr-4 text-gray-500 font-medium">{t("feature")}</th>
                  {tiers.map((tier) => (
                    <th key={tier.key} className="py-3 px-4 text-center text-gray-300 font-bold">{tier.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_ROWS.map((row) => (
                  <tr key={row} className="border-b border-gray-800/50">
                    <td className="py-3 pr-4 text-gray-400">{t(`compare_${row}`)}</td>
                    {tiers.map((tier) => {
                      const val = tier.comparison[row];
                      return (
                        <td key={tier.key} className="py-3 px-4 text-center">
                          {val === "soon" ? (
                            <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                              {t("comingSoonLabel")}
                            </span>
                          ) : val === true ? (
                            <Check size={16} className="text-emerald-400 mx-auto" />
                          ) : val === false ? (
                            <XIcon size={16} className="text-gray-700 mx-auto" />
                          ) : (
                            <span className="text-gray-300">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-gray-100 text-center mb-8">{t("faqTitle")}</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="text-sm font-medium text-gray-200">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform duration-200 shrink-0 ml-4 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center text-sm text-gray-600 mt-12"
        >
          {t("contactHint")}{" "}
          <span className="text-amber-400">hello@veractum.app</span>
        </motion.p>
      </div>
    </div>
  );
}
