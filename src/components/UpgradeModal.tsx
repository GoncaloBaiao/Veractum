"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export function UpgradeModal({ isOpen, onClose, reason }: UpgradeModalProps) {
  const t = useTranslations("upgrade");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-md bg-gray-900 border border-amber-500/30 rounded-2xl p-8 shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-gray-300 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <Zap size={28} className="text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-100 mb-2">{t("title")}</h2>
              <p className="text-sm text-gray-500">
                {reason || t("description")}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <span className="text-amber-400">✓</span> {t("benefit1")}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <span className="text-amber-400">✓</span> {t("benefit2")}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <span className="text-amber-400">✓</span> {t("benefit3")}
              </div>
            </div>

            <Link
              href="/pricing"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl px-6 py-3.5 text-sm transition-all hover:shadow-lg hover:shadow-amber-500/25"
            >
              {t("seePlans")}
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
