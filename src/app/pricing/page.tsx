"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { PRICING_TIERS } from "@/lib/utils";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function PricingPage() {
  return (
    <div className="pt-32 pb-20">
      <div className="page-container">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-label mb-3 inline-block">Pricing</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-100 mb-6">
            Simple, transparent{" "}
            <span className="gradient-text">pricing</span>
          </h1>
          <p className="max-w-xl mx-auto text-gray-400 leading-relaxed">
            Start free, upgrade when you need more. No hidden fees, no surprises.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {PRICING_TIERS.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col bg-gray-900 rounded-2xl p-8 transition-all duration-300 ${
                tier.highlighted
                  ? "border-2 border-amber-500/50 shadow-lg shadow-amber-500/10 scale-[1.02]"
                  : "border-2 border-gray-800 hover:border-amber-500/30"
              }`}
            >
              {/* Most Popular badge */}
              {tier.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500 text-black text-xs font-bold">
                    <Sparkles size={12} />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Tier name */}
              <h2 className="text-lg font-bold text-gray-100 mb-2">{tier.name}</h2>
              <p className="text-sm text-gray-500 mb-6">{tier.description}</p>

              {/* Price */}
              <div className="mb-8">
                <span className="text-4xl font-black text-gray-100">{tier.price}</span>
                <span className="text-gray-500 ml-2 text-sm">/ {tier.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
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

              {/* CTA */}
              <button
                className={`w-full flex items-center justify-center gap-2 font-bold rounded-xl px-6 py-3.5 text-sm transition-all ${
                  tier.highlighted
                    ? "bg-amber-500 hover:bg-amber-600 text-black hover:shadow-lg hover:shadow-amber-500/25"
                    : "border-2 border-gray-700 hover:border-amber-400 text-gray-300 hover:text-white"
                }`}
              >
                {tier.cta}
                <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* FAQ hint */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-sm text-gray-600 mt-12"
        >
          Need something custom? Contact us at{" "}
          <span className="text-amber-400">hello@veractum.app</span>
        </motion.p>
      </div>
    </div>
  );
}
