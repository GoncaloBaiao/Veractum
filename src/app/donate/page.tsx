"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const AMOUNTS = [
  { value: 3, emoji: "☕", key: "amount3" },
  { value: 5, emoji: "🧁", key: "amount5" },
  { value: 10, emoji: "🍕", key: "amount10" },
  { value: 25, emoji: "🚀", key: "amount25" },
];

export default function DonatePage() {
  const t = useTranslations("donate");
  const [selectedAmount, setSelectedAmount] = useState<number>(5);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

  const handleDonate = async () => {
    if (!finalAmount || finalAmount <= 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "donation", amount: finalAmount.toString() }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-36 pb-28">
      <div className="page-container max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-10"
        >
          <ArrowLeft size={16} />
          {t("backHome")}
        </Link>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-pink-500/10 flex items-center justify-center mx-auto mb-6">
            <Heart size={32} className="text-pink-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-100 mb-4">
            {t("title")}
          </h1>
          <p className="text-gray-400 leading-relaxed mb-12 max-w-lg mx-auto">
            {t("description")}
          </p>
        </motion.div>

        {/* Preset amounts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {AMOUNTS.map((amount, index) => (
            <motion.button
              key={amount.value}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className={`group relative bg-gray-900 border-2 rounded-2xl p-5 transition-all duration-300 text-center ${
                selectedAmount === amount.value && !customAmount
                  ? "border-amber-500 shadow-lg shadow-amber-500/10"
                  : "border-gray-800 hover:border-amber-500/50"
              }`}
              onClick={() => { setSelectedAmount(amount.value); setCustomAmount(""); }}
            >
              <span className="text-3xl mb-2 block">{amount.emoji}</span>
              <span className="text-xl font-black text-gray-100">€{amount.value}</span>
              <p className="text-xs text-gray-400 mt-1">{t(amount.key)}</p>
            </motion.button>
          ))}
        </div>

        {/* Custom amount */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mb-8"
        >
          <label className="text-sm text-gray-400 mb-2 block">{t("customAmountLabel")}</label>
          <div className="flex gap-3">
            <input
              type="number"
              min="1"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(5); }}
              placeholder="Ex: 7"
              className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 text-sm"
            />
            <button
              onClick={() => void handleDonate()}
              disabled={loading || !finalAmount || finalAmount <= 0}
              className="bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold rounded-xl px-6 py-3 text-sm transition-all whitespace-nowrap flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {t("donateButton")} (€{finalAmount > 0 ? finalAmount : "?"})
            </button>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="text-center"
        >
          {!customAmount && (
            <button
              onClick={() => void handleDonate()}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold rounded-xl px-10 py-3.5 text-sm transition-all hover:shadow-lg hover:shadow-amber-500/25 mb-6"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} />}
              {t("donateButton")} (€{selectedAmount})
            </button>
          )}
          <p className="text-xs text-gray-600 mt-4">
            {t("comingSoon")}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
