"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Link as LinkIcon,
  Brain,
  FileCheck,
  Zap,
  Search,
  Shield,
  BarChart3,
  Play,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { VideoInput } from "@/components/VideoInput";

/* ─── Fake demo data ─── */

const DEMO_CLAIMS = [
  {
    text: "The global average temperature has risen by 1.1°C since pre-industrial times.",
    status: "supported" as const,
    confidence: 92,
    sources: [
      { title: "IPCC Sixth Assessment Report", domain: "ipcc.ch" },
      { title: "NASA Global Temperature", domain: "climate.nasa.gov" },
    ],
    reasoning:
      "This claim is well-supported by multiple authoritative scientific sources including the IPCC AR6 and NASA GISS datasets.",
  },
  {
    text: "Renewable energy is now cheaper than fossil fuels in every country.",
    status: "contested" as const,
    confidence: 45,
    sources: [
      { title: "IRENA Renewable Cost Report 2024", domain: "irena.org" },
    ],
    reasoning:
      "While renewables are cheaper in many regions, this absolute claim is contested — some developing nations still face higher renewable costs due to infrastructure gaps.",
  },
  {
    text: "This is the most important decade for climate action in human history.",
    status: "opinion" as const,
    confidence: 0,
    sources: [],
    reasoning:
      "This is a value judgment and rhetorical framing. While many scientists emphasize urgency, 'most important' is subjective.",
  },
] as const;

const DEMO_SUMMARY_POINTS = [
  "The video discusses the latest climate science findings from the 2024 IPCC update.",
  "Key focus on temperature rise, tipping points, and renewable energy cost trends.",
  "Concludes with a call to action for policy changes in the next five years.",
];

const STATUS_CONFIG = {
  supported: {
    icon: CheckCircle,
    label: "Supported",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
    barColor: "bg-emerald-500",
  },
  contested: {
    icon: AlertTriangle,
    label: "Contested",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/30",
    barColor: "bg-amber-500",
  },
  opinion: {
    icon: MessageCircle,
    label: "Opinion",
    color: "text-gray-400",
    bg: "bg-gray-400/10",
    border: "border-gray-400/30",
    barColor: "bg-gray-500",
  },
} as const;

const STEPS = [
  {
    icon: LinkIcon,
    title: "Paste a YouTube Link",
    description:
      "Drop any YouTube URL into Veractum. We support standard watch links, short links, and embedded URLs.",
  },
  {
    icon: Brain,
    title: "AI Extracts & Analyses",
    description:
      "Our AI fetches the transcript, generates a structured summary, extracts claims, and fact-checks each one.",
  },
  {
    icon: FileCheck,
    title: "Get Your Report",
    description:
      "Receive a comprehensive report with key points, a visual timeline, and every claim rated with sources.",
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Summary",
    description:
      "Get the key points of any video in seconds. No more scrubbing through hours of content to find what matters.",
  },
  {
    icon: Search,
    title: "Claim Extraction",
    description:
      "AI identifies every factual statement, opinion, and prediction — then separates signal from noise.",
  },
  {
    icon: Shield,
    title: "Source-backed Fact-check",
    description:
      "Every claim is checked against real sources. See the evidence, not just a verdict.",
  },
  {
    icon: BarChart3,
    title: "Visual Timeline",
    description:
      "A colour-coded timeline shows what was discussed and when, so you can jump straight to what matters.",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const router = useRouter();
  const t = useTranslations();
  const heroT = useTranslations("hero");
  const howT = useTranslations("howItWorks");
  const featT = useTranslations("features");
  const demoT = useTranslations("demo");
  const ctaT = useTranslations("cta");

  const STEPS_I18N = [
    { icon: LinkIcon, title: howT("step1Title"), description: howT("step1Desc") },
    { icon: Brain, title: howT("step2Title"), description: howT("step2Desc") },
    { icon: FileCheck, title: howT("step3Title"), description: howT("step3Desc") },
  ];

  const FEATURES_I18N = [
    { icon: Zap, title: featT("instantSummary"), description: featT("instantSummaryDesc") },
    { icon: Search, title: featT("claimExtraction"), description: featT("claimExtractionDesc") },
    { icon: Shield, title: featT("factCheck"), description: featT("factCheckDesc") },
    { icon: BarChart3, title: featT("timeline"), description: featT("timelineDesc") },
  ];

  const handleAnalyse = (url: string) => {
    const encoded = encodeURIComponent(url);
    router.push(`/analysis/new?url=${encoded}`);
  };

  return (
    <>
      {/* ═══════════════ HERO ═══════════════ */}
      <section id="hero" className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Decorative glow blob */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-b from-amber-600/20 to-transparent rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="page-container relative z-10 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-gray-100 mb-6">
              {heroT("title1")}
              <br />
              <span className="gradient-text">{heroT("title2")}</span>
            </h1>
          </motion.div>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-400 leading-relaxed mb-10"
          >
            {heroT("subtitle")}
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <VideoInput onSubmit={handleAnalyse} />
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#demo"
              className="border-2 border-gray-700 hover:border-amber-400 text-gray-300 hover:text-white rounded-xl px-8 py-3.5 font-medium transition-all text-sm"
            >
              {heroT("seeExample")}
            </a>
          </motion.div>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-8 text-sm text-gray-600"
          >
            {heroT("trusted")}
          </motion.p>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section id="how-it-works" className="section-spacing relative">
        <div className="page-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="text-label mb-3 inline-block">{howT("label")}</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-100">
              {howT("title", { highlight: "" })}<span className="gradient-text">{howT("highlight")}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {STEPS_I18N.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={fadeInUp}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-900 border-2 border-gray-800 rounded-2xl p-8 hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 group"
                >
                  {/* Numbered circle with amber gradient */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center mb-6 group-hover:from-amber-500/30 group-hover:to-orange-500/20 transition-all">
                    <Icon size={24} className="text-amber-400" />
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-mono text-amber-500/60">0{index + 1}</span>
                    <h3 className="text-lg font-bold text-gray-100">{step.title}</h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed text-sm">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="section-spacing relative">
        <div className="page-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="text-label mb-3 inline-block">{featT("label")}</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-100">
              {featT("title", { highlight: "" })}{" "}
              <span className="gradient-text">{featT("highlight")}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {FEATURES_I18N.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={fadeInUp}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="bg-gray-900 border-2 border-gray-800 rounded-2xl p-8 hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center mb-5 group-hover:from-amber-500/30 group-hover:to-orange-500/20 transition-all">
                    <Icon size={22} className="text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-100 mb-2">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ DEMO PREVIEW ═══════════════ */}
      <section id="demo" className="section-spacing relative">
        {/* Decorative glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-b from-amber-600/8 to-transparent rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="page-container relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="text-label mb-3 inline-block">{demoT("label")}</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-100">
              {demoT("title", { highlight: "" })}<span className="gradient-text">{demoT("highlight")}</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative rounded-3xl border border-amber-500/20 bg-gray-900/50 backdrop-blur-sm p-6 sm:p-8 lg:p-10 overflow-hidden"
          >
            {/* Example label */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
              <span className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-400">
                {demoT("exampleAnalysis")}
              </span>
            </div>

            {/* ── Video card ── */}
            <div className="flex flex-col sm:flex-row gap-5 mb-8 pb-8 border-b border-gray-800/50">
              {/* Thumbnail */}
              <div className="relative w-full sm:w-72 aspect-video rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden shrink-0">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <Play size={24} className="text-white ml-1" />
                  </div>
                </div>
                {/* Duration badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-mono px-2 py-0.5 rounded">
                  18:42
                </div>
              </div>

              {/* Video info */}
              <div className="flex flex-col justify-center">
                <h3 className="text-lg font-bold text-gray-100 mb-1.5 leading-tight">
                  Climate Science 2024: What the Latest Data Really Shows
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <User size={14} />
                    <span>Science Explained</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>18:42</span>
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">1.2M views</span>
                </div>
              </div>
            </div>

            {/* ── Summary block ── */}
            <div className="mb-8 pb-8 border-b border-gray-800/50">
              <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">
                {demoT("summary")}
              </h4>
              <ul className="space-y-2.5">
                {DEMO_SUMMARY_POINTS.map((point, idx) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="text-gray-300 text-sm leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Claim cards ── */}
            <div>
              <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5">
                {demoT("extractedClaims")}
              </h4>
              <div className="space-y-4">
                {DEMO_CLAIMS.map((claim, idx) => {
                  const config = STATUS_CONFIG[claim.status];
                  const StatusIcon = config.icon;

                  return (
                    <div
                      key={idx}
                      className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 hover:border-amber-500/20 transition-all"
                    >
                      {/* Status badge + claim text */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <p className="text-gray-200 text-sm leading-relaxed flex-1">
                          &ldquo;{claim.text}&rdquo;
                        </p>
                        <span
                          className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.border} ${config.color}`}
                        >
                          <StatusIcon size={11} />
                          {config.label}
                        </span>
                      </div>

                      {/* Confidence bar */}
                      {claim.confidence > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">{demoT("confidence")}</span>
                            <span className="text-xs font-mono text-gray-500">
                              {claim.confidence}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${claim.confidence}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 + idx * 0.2 }}
                              className={`h-full rounded-full ${config.barColor}`}
                            />
                          </div>
                        </div>
                      )}

                      {/* Sources */}
                      {claim.sources.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {claim.sources.map((source, sIdx) => (
                            <span
                              key={sIdx}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-800/60 border border-gray-700/50 text-xs text-gray-500"
                            >
                              {source.title}
                              <ExternalLink size={9} className="text-gray-600" />
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="section-spacing relative">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-gradient-to-b from-amber-600/10 to-transparent rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="page-container relative z-10 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-100 mb-6">
              {ctaT("title")}{" "}
              <span className="gradient-text">{ctaT("highlight")}</span>?
            </h2>
            <p className="max-w-xl mx-auto text-gray-400 leading-relaxed mb-10">
              {ctaT("subtitle")}
            </p>
            <a
              href="#hero"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl px-10 py-4 transition-all hover:shadow-lg hover:shadow-amber-500/50 text-base"
            >
              {ctaT("button")}
              <ArrowRight size={18} />
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
