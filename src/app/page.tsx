"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Link from "next/link";
import { SplashScreen } from "@/components/SplashScreen";

const FONT: React.CSSProperties = { fontFamily: "'Satoshi', system-ui, sans-serif" };
const ACCENT = "#E8A020";

function Corners() {
  const s: React.CSSProperties = {
    position: "absolute",
    width: 12,
    height: 12,
    borderColor: ACCENT,
    borderStyle: "solid",
    opacity: 0.4,
  };
  return (
    <>
      <span style={{ ...s, top: 8, left: 8, borderWidth: "1px 0 0 1px" }} />
      <span style={{ ...s, top: 8, right: 8, borderWidth: "1px 1px 0 0" }} />
      <span style={{ ...s, bottom: 8, left: 8, borderWidth: "0 0 1px 1px" }} />
      <span style={{ ...s, bottom: 8, right: 8, borderWidth: "0 1px 1px 0" }} />
    </>
  );
}

function Pin() {
  return (
    <span
      style={{
        position: "absolute",
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: ACCENT,
        top: -6,
        left: "50%",
        transform: "translateX(-50%)",
        boxShadow: "0 0 8px rgba(232,160,32,0.5)",
        zIndex: 2,
      }}
    />
  );
}

function ScanLine({ active }: { active: boolean }) {
  return (
    <motion.div
      initial={{ top: 0, opacity: 0 }}
      animate={active ? { top: "100%", opacity: [1, 1, 0] } : { top: 0, opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeIn" }}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        height: 2,
        background: "linear-gradient(90deg,transparent,rgba(232,160,32,0.6),transparent)",
        pointerEvents: "none",
        zIndex: 3,
      }}
    />
  );
}

function Redacted({ width }: { width: number }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: "#1a1a1a",
        borderRadius: 2,
        height: 10,
        width,
      }}
    />
  );
}

const cardBase: React.CSSProperties = {
  position: "relative",
  background: "#0f0f0f",
  border: "1px solid #1e1e1e",
  overflow: "hidden",
  ...FONT,
};

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const t = useTranslations();

  const [mainVisible, setMainVisible] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);

  const handleEnter = useCallback(() => setMainVisible(true), []);

  const handleAnalyse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    router.push(`/analysis/new?url=${encodeURIComponent(url.trim())}`);
  };

  const tier = (session?.user as { tier?: string } | undefined)?.tier ?? "free";
  const tierLabel =
    tier === "veractor" ? "Veractor" : tier === "analyst" ? "Analyst" : "Observer";

  const cardBorder = (key: string) =>
    hovered === key ? `1px solid ${ACCENT}` : "1px solid #1e1e1e";

  return (
    <>
      <SplashScreen onEnter={handleEnter} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: mainVisible ? 1 : 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        style={{
          position: "fixed",
          inset: 0,
          background: "#0a0a0a",
          pointerEvents: mainVisible ? "all" : "none",
          ...FONT,
        }}
      >
        {/* Global scanline */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.012) 3px,rgba(255,255,255,0.012) 4px)",
            pointerEvents: "none",
            zIndex: 50,
          }}
        />

        {/* NAVBAR */}
        <nav
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: 52,
            borderBottom: "1px solid #1a1a1a",
            display: "flex",
            alignItems: "center",
            padding: "0 28px",
            gap: 32,
            zIndex: 10,
            background: "#0a0a0a",
            ...FONT,
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <span style={{ width: 8, height: 8, background: ACCENT, borderRadius: "50%", display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>VERACTUM</span>
          </Link>

          <div style={{ display: "flex", gap: 24, marginLeft: "auto" }}>
            {([
              { label: t("nav.howItWorks"), href: "/#how-it-works" },
              { label: t("nav.pricing"), href: "/pricing" },
              { label: t("nav.history"), href: "/history" },
            ] as { label: string; href: string }[]).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{ fontSize: 12, color: "#555", letterSpacing: "1px", textTransform: "uppercase", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = ACCENT)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#555")}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {session?.user ? (
            <span style={{ fontSize: 11, letterSpacing: 2, color: ACCENT, border: "1px solid #3a2800", background: "#1a0e00", padding: "3px 10px", textTransform: "uppercase" }}>
              {tierLabel}
            </span>
          ) : (
            <Link
              href="/?login=true"
              style={{ fontSize: 11, letterSpacing: 2, color: ACCENT, border: "1px solid #3a2800", background: "#1a0e00", padding: "3px 10px", textTransform: "uppercase", textDecoration: "none" }}
            >
              Sign In
            </Link>
          )}
        </nav>

        {/* BOARD GRID */}
        <div
          className="dossier-board"
          style={{
            position: "absolute",
            top: 52, left: 0, right: 0, bottom: 0,
            padding: "24px 20px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: 14,
          }}
        >
          {/* CARD 1 - Analyse (left, full height) */}
          <motion.div
            onHoverStart={() => setHovered("analyse")}
            onHoverEnd={() => setHovered(null)}
            whileHover={{ y: -2 }}
            style={{ ...cardBase, gridColumn: 1, gridRow: "1 / 3", border: cardBorder("analyse"), padding: 28, cursor: "default", transition: "border-color 0.3s" }}
          >
            <ScanLine active={hovered === "analyse"} />
            <Corners />
            <Pin />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(232,160,32,0) 0%,rgba(232,160,32,0.04) 100%)", opacity: hovered === "analyse" ? 1 : 0, transition: "opacity 0.3s", pointerEvents: "none" }} />

            <p style={{ fontSize: 9, letterSpacing: 3, color: ACCENT, textTransform: "uppercase", marginBottom: 16, opacity: 0.7 }}>
              — Case File 001 — Analyse
            </p>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: 10, letterSpacing: "-0.5px" }}>
              Analyse any<br />YouTube video.
            </h2>
            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 24 }}>
              Paste a link. Extract the transcript, verify every claim, expose the truth with sources.
            </p>

            <form onSubmit={handleAnalyse} style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste a YouTube link..."
                style={{ flex: 1, background: "#0a0a0a", border: "1px solid #2a2a2a", color: "#888", fontFamily: "inherit", fontSize: 12, padding: "8px 12px", outline: "none" }}
                onFocus={(e) => { e.target.style.borderColor = ACCENT; e.target.style.color = "#fff"; }}
                onBlur={(e) => { e.target.style.borderColor = "#2a2a2a"; e.target.style.color = "#888"; }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{ background: ACCENT, border: "none", color: "#000", fontFamily: "inherit", fontSize: 11, fontWeight: 700, letterSpacing: 2, padding: "8px 16px", cursor: loading ? "wait" : "pointer", textTransform: "uppercase", opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "..." : t("hero.analyseButton")}
              </button>
            </form>

            {error && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 8 }}>{error}</p>}

            <p style={{ marginTop: 10, fontSize: 10, color: "#333", letterSpacing: 1 }}>
              {t("hero.trusted").toUpperCase()}
            </p>

            <div style={{ position: "absolute", bottom: 16, right: 16, border: "2px solid rgba(232,160,32,0.3)", color: "rgba(232,160,32,0.25)", fontSize: 11, letterSpacing: 3, padding: "4px 10px", textTransform: "uppercase", transform: "rotate(-8deg)", fontWeight: 700, userSelect: "none" }}>
              Classified
            </div>
          </motion.div>

          {/* CARD 2 - How it Works (top right) */}
          <motion.div
            onHoverStart={() => setHovered("how")}
            onHoverEnd={() => setHovered(null)}
            whileHover={{ y: -2 }}
            style={{ ...cardBase, gridColumn: 2, gridRow: 1, border: cardBorder("how"), padding: 24, cursor: "pointer", transition: "border-color 0.3s" }}
            onClick={() => router.push("/pricing")}
          >
            <ScanLine active={hovered === "how"} />
            <Corners />
            <Pin />

            <p style={{ fontSize: 9, letterSpacing: 3, color: ACCENT, textTransform: "uppercase", marginBottom: 14, opacity: 0.7 }}>
              — Procedure — {t("nav.howItWorks")}
            </p>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: 16, letterSpacing: "-0.5px" }}>
              {t("howItWorks.title")}<br />
              <span style={{ color: ACCENT }}>{t("howItWorks.highlight")}.</span>
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { n: "01", label: t("howItWorks.step1Title") },
                { n: "02", label: t("howItWorks.step2Title") },
                { n: "03", label: t("howItWorks.step3Title") },
              ].map(({ n, label }) => (
                <div key={n} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: ACCENT, letterSpacing: 2, flexShrink: 0 }}>{n}</span>
                  <span style={{ fontSize: 12, color: "#444" }}>{label}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, fontSize: 11, letterSpacing: 2, color: ACCENT, textTransform: "uppercase" }}>
              View procedure →
            </div>
          </motion.div>

          {/* Bottom right - Pricing + History */}
          <div style={{ gridColumn: 2, gridRow: 2, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

            {/* Pricing */}
            <motion.div
              onHoverStart={() => setHovered("pricing")}
              onHoverEnd={() => setHovered(null)}
              whileHover={{ y: -2 }}
              style={{ ...cardBase, border: cardBorder("pricing"), padding: 20, cursor: "pointer", transition: "border-color 0.3s" }}
              onClick={() => router.push("/pricing")}
            >
              <ScanLine active={hovered === "pricing"} />
              <Corners />
              <Pin />
              <p style={{ fontSize: 9, letterSpacing: 3, color: ACCENT, textTransform: "uppercase", marginBottom: 12, opacity: 0.7 }}>— Clearance Levels</p>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 14, letterSpacing: "-0.5px" }}>
                Choose your<br />clearance.
              </h3>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { name: "Observer", price: "€0", active: false },
                  { name: "Analyst", price: "€9", active: true },
                  { name: "Veractor", price: "€29", active: false },
                ].map(({ name, price, active }) => (
                  <div key={name} style={{ flex: 1, border: active ? `1px solid ${ACCENT}` : "1px solid #1e1e1e", background: active ? "#0d0800" : "transparent", padding: "8px 6px", textAlign: "center" }}>
                    <div style={{ fontSize: 8, color: active ? ACCENT : "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>{name}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: active ? ACCENT : "#fff" }}>{price}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, fontSize: 10, letterSpacing: 2, color: ACCENT, textTransform: "uppercase" }}>View all →</div>
            </motion.div>

            {/* History */}
            <motion.div
              onHoverStart={() => setHovered("history")}
              onHoverEnd={() => setHovered(null)}
              whileHover={{ y: -2 }}
              style={{ ...cardBase, border: cardBorder("history"), padding: 20, cursor: "pointer", transition: "border-color 0.3s" }}
              onClick={() => router.push("/history")}
            >
              <ScanLine active={hovered === "history"} />
              <Corners />
              <Pin />
              <p style={{ fontSize: 9, letterSpacing: 3, color: ACCENT, textTransform: "uppercase", marginBottom: 12, opacity: 0.7 }}>— Archive</p>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 14, letterSpacing: "-0.5px" }}>
                Your case<br />files.
              </h3>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {[
                  { w: 120, time: "2h ago" },
                  { w: 90, time: "1d ago" },
                  { w: 105, time: "3d ago" },
                ].map(({ w, time }, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < 2 ? "1px solid #151515" : "none" }}>
                    <Redacted width={w} />
                    <span style={{ fontSize: 9, color: "#333" }}>{time}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, fontSize: 10, letterSpacing: 2, color: ACCENT, textTransform: "uppercase" }}>Open archive →</div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
}