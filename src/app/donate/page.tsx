"use client";

import { motion } from "framer-motion";
import { Heart, Coffee, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const AMOUNTS = [
  { value: 3, emoji: "☕", label: "Coffee" },
  { value: 5, emoji: "🧁", label: "Snack" },
  { value: 10, emoji: "🍕", label: "Pizza" },
];

export default function DonatePage() {
  const t = useTranslations("donate");

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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          {AMOUNTS.map((amount, index) => (
            <motion.button
              key={amount.value}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-gray-900 border-2 border-gray-800 rounded-2xl p-6 hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 text-center"
              onClick={() => {
                // Placeholder — payment integration coming soon
              }}
            >
              <span className="text-4xl mb-3 block">{amount.emoji}</span>
              <span className="text-2xl font-black text-gray-100">€{amount.value}</span>
              <p className="text-sm text-gray-500 mt-1">{t(`amount${amount.value}`)}</p>
              <div className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Coffee size={14} />
                {t("support")}
              </div>
            </motion.button>
          ))}
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-sm text-gray-600">
            {t("comingSoon")}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
