"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onEnter: () => void;
}

export function SplashScreen({ onEnter }: SplashScreenProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("splash_seen");
    if (!seen) {
      setVisible(true);
    } else {
      onEnter();
    }
  }, [onEnter]);

  const handleEnter = () => {
    sessionStorage.setItem("splash_seen", "1");
    setVisible(false);
    setTimeout(onEnter, 1200);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: "#0a0a0a" }}
        >
          {/* Scanline overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-10"
            style={{
              background:
                "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.012) 3px,rgba(255,255,255,0.012) 4px)",
            }}
          />

          {/* Tag */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative z-20 text-[11px] tracking-[6px] uppercase mb-8"
            style={{ color: "#555", fontFamily: "'Satoshi', system-ui, sans-serif" }}
          >
            Veractum — Intelligence System
          </motion.p>

          {/* Hero text */}
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="relative z-20 text-5xl font-black text-center leading-tight mb-12"
            style={{
              letterSpacing: "-1px",
              color: "#fff",
              fontFamily: "'Satoshi', system-ui, sans-serif",
            }}
          >
            Find the
            <br />
            <span style={{ color: "#E8A020" }}>Truth.</span>
          </motion.h1>

          {/* Magnifying glass SVG */}
          <motion.div
            initial={{ opacity: 0, scale: 4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, duration: 1.2, ease: "easeOut" }}
            className="relative z-20 mb-10"
          >
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
              <circle cx="32" cy="32" r="22" stroke="#E8A020" strokeWidth="3" />
              <circle
                cx="32"
                cy="32"
                r="16"
                stroke="#E8A020"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.4"
              />
              <line
                x1="48"
                y1="48"
                x2="68"
                y2="68"
                stroke="#E8A020"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M24 32 L29 38 L42 24"
                stroke="#E8A020"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>

          {/* Enter button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            onClick={handleEnter}
            className="relative z-20 text-[13px] tracking-[4px] uppercase py-3 px-9 cursor-pointer transition-all duration-200"
            style={{
              background: "transparent",
              border: "1px solid #E8A020",
              color: "#E8A020",
              fontFamily: "'Satoshi', system-ui, sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#E8A020";
              e.currentTarget.style.color = "#000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#E8A020";
            }}
          >
            Enter
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
