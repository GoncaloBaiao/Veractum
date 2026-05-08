"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { SplashScreen } from "@/components/SplashScreen";
import { LoginModal } from "@/components/LoginModal";
import { LanguageSelector } from "@/components/LanguageSelector";
import type { AnalysisListItem } from "@/types";

const FONT: React.CSSProperties = { fontFamily: "Satoshi, system-ui, sans-serif" };
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
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: ACCENT,
        top: -5,
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
        background: "#1e1e1e",
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
  const [hovered, setHovered] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleEnter = useCallback(() => setMainVisible(true), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/analyze?history=true")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data?.data)) {
          setAnalyses(data.data as AnalysisListItem[]);
        }
      })
      .catch(() => {});
  }, [!!session?.user]);

  const handleAnalyse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    router.push("/analysis/new?url=" + encodeURIComponent(url.trim()));
  };

  const tier = (session?.user as { tier?: string } | undefined)?.tier ?? "free";
  const tierLabel =
    tier === "veractor" ? "Veractor" : tier === "analyst" ? "Analyst" : "Observer";
  const caseNumber = String(analyses.length + 1).padStart(3, "0");
  const cardBorder = (key: string) =>
    hovered === key ? "1px solid " + ACCENT : "1px solid #1e1e1e";

  const navLinks = [
    { label: t("nav.howItWorks"), href: "/docs" },
    { label: t("nav.pricing"), href: "/pricing" },
    { label: t("nav.history"), href: "/history" },
  ];

  const archiveRows: { label: string; time: string }[] =
    analyses.length > 0
      ? analyses.slice(0, 4).map((a) => ({
          label: a.videoTitle,
          time: (() => {
            const diff = Date.now() - new Date(a.createdAt).getTime();
            const h = Math.floor(diff / 3600000);
            const d = Math.floor(diff / 86400000);
            if (h < 1) return "just now";
            if (h < 24) return h + "h ago";
            return d + "d ago";
          })(),
        }))
      : [
          { label: "", time: "2h ago" },
          { label: "", time: "1d ago" },
          { label: "", time: "3d ago" },
          { label: "", time: "5d ago" },
        ];

  return (
    <>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <SplashScreen onEnter={handleEnter} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: mainVisible ? 1 : 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="dossier-root"
        style={{
          position: "fixed",
          inset: 0,
          background: "#0a0a0a",
          pointerEvents: mainVisible ? "all" : "none",
          ...FONT,
        }}
      >
        {/* Scanline overlay */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            background:
              "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.012) 3px,rgba(255,255,255,0.012) 4px)",
            pointerEvents: "none",
            zIndex: 50,
          }}
        />

        {/* DOSSIER NAVBAR */}
        <nav
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 52,
            borderBottom: "1px solid #1a1a1a",
            display: "flex",
            alignItems: "center",
            padding: "0 28px",
            gap: 24,
            zIndex: 10,
            background: "#0a0a0a",
            ...FONT,
          }}
        >
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
          >
            <Image
              src="/WizeApple.png"
              alt="Veractum logo"
              width={40}
              height={40}
              style={{ objectFit: "contain" }}
            />
            <span
              style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}
            >
              VERACTUM
            </span>
          </Link>

          <div className="dossier-nav-links" style={{ display: "flex", gap: 22, marginLeft: "auto" }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: 11,
                  color: "#555",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = ACCENT)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "#555")
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="dossier-lang" style={{ display: "flex", alignItems: "center" }}>
          </div>

          {session?.user ? (
            <div ref={userMenuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 0",
                  fontFamily: "inherit",
                }}
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={28}
                    height={28}
                    style={{ borderRadius: "50%", border: "1px solid #333" }}
                  />
                ) : (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#1a0e00",
                      border: "1px solid #3a2800",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      color: ACCENT,
                    }}
                  >
                    {(session.user.name ?? "?")[0].toUpperCase()}
                  </div>
                )}
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: 2,
                    color: ACCENT,
                    border: "1px solid #3a2800",
                    background: "#1a0e00",
                    padding: "3px 10px",
                    textTransform: "uppercase",
                  }}
                >
                  {tierLabel}
                </span>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      width: 220,
                      background: "#111",
                      border: "1px solid #222",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                      zIndex: 100,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{ padding: "12px 16px", borderBottom: "1px solid #1e1e1e" }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#ddd",
                          marginBottom: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {session.user.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#444",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {session.user.email}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        void signOut({ callbackUrl: "/" });
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 16px",
                        background: "none",
                        border: "none",
                        color: "#555",
                        fontSize: 12,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = "#fff")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = "#555")
                      }
                    >
                      {t("nav.signOut")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              style={{
                fontSize: 11,
                letterSpacing: 2,
                color: ACCENT,
                border: "1px solid #3a2800",
                background: "#1a0e00",
                padding: "4px 14px",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {t("nav.signIn")}
            </button>
          )}
        </nav>

        {/* BOARD: How it Works + Donate (left) | Analyse (center) | Clearance + Archive (right) */}
        <div
          className="dossier-board"
          style={{
            position: "absolute",
            top: 52,
            left: 0,
            right: 0,
            bottom: 0,
            padding: "28px 20px 18px",
            display: "grid",
            gridTemplateColumns: "1fr 1.5fr 1fr",
            gap: 14,
          }}
        >
          {/* ── COL 1: How it Works + Donate (left, stacked) ── */}
          <div className="dossier-col" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <motion.div
              onHoverStart={() => setHovered("how")}
              onHoverEnd={() => setHovered(null)}
              whileHover={{ y: -2 }}
              style={{
                ...cardBase,
                border: cardBorder("how"),
                padding: "22px 22px",
                cursor: "pointer",
                transition: "border-color 0.3s",
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
              onClick={() => router.push("/docs")}
            >
              <ScanLine active={hovered === "how"} />
              <Corners />
              <Pin />
              <p
                style={{
                  fontSize: 9,
                  letterSpacing: 3,
                  color: ACCENT,
                  textTransform: "uppercase",
                  marginBottom: 12,
                  opacity: 0.7,
                }}
              >
                — {t("home.procedureLabel")} — {t("nav.howItWorks")}
              </p>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1.25,
                  marginBottom: 16,
                  letterSpacing: "-0.5px",
                }}
              >
                {t("howItWorks.title")}
                <br />
                <span style={{ color: ACCENT }}>{t("howItWorks.highlight")}.</span>
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                {[
                  { n: "01", title: t("howItWorks.step1Title"), desc: t("howItWorks.step1Desc") },
                  { n: "02", title: t("howItWorks.step2Title"), desc: t("howItWorks.step2Desc") },
                  { n: "03", title: t("howItWorks.step3Title"), desc: t("howItWorks.step3Desc") },
                ].map(({ n, title, desc }) => (
                  <div key={n} style={{ display: "flex", gap: 10 }}>
                    <span
                      style={{
                        fontSize: 10,
                        color: ACCENT,
                        letterSpacing: 2,
                        flexShrink: 0,
                        marginTop: 1,
                        fontWeight: 700,
                      }}
                    >
                      {n}
                    </span>
                    <div>
                      <div style={{ fontSize: 11, color: "#bbb", fontWeight: 600, marginBottom: 2 }}>
                        {title}
                      </div>
                      <div style={{ fontSize: 10, color: "#3a3a3a", lineHeight: 1.5 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontSize: 10,
                  letterSpacing: 2,
                  color: ACCENT,
                  textTransform: "uppercase",
                }}
              >
                {t("home.viewProcedure")} →
              </div>
            </motion.div>

            {/* Donate */}
            <motion.div
              onHoverStart={() => setHovered("donate")}
              onHoverEnd={() => setHovered(null)}
              whileHover={{ y: -2 }}
              style={{
                ...cardBase,
                border: cardBorder("donate"),
                padding: "22px 22px",
                cursor: "pointer",
                transition: "border-color 0.3s",
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
              onClick={() => router.push("/donate")}
            >
              <ScanLine active={hovered === "donate"} />
              <Corners />
              <Pin />
              <p
                style={{
                  fontSize: 9,
                  letterSpacing: 3,
                  color: ACCENT,
                  textTransform: "uppercase",
                  marginBottom: 12,
                  opacity: 0.7,
                }}
              >
                — {t("home.supportLabel")}
              </p>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 6,
                  letterSpacing: "-0.5px",
                }}
              >
                {t("home.supportTitle")}
              </h3>
              <p style={{ fontSize: 11, color: "#3a3a3a", lineHeight: 1.6, flex: 1 }}>
                {t("home.supportSubtitle")}
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 6,
                  margin: "14px 0",
                }}
              >
                {["\u20ac3", "\u20ac10", "\u20ac25"].map((amt) => (
                  <div
                    key={amt}
                    style={{
                      border: "1px solid #1e1e1e",
                      padding: "7px 4px",
                      textAlign: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#555",
                    }}
                  >
                    {amt}
                  </div>
                ))}
              </div>
              <div
                style={{ fontSize: 10, letterSpacing: 2, color: ACCENT, textTransform: "uppercase" }}
              >
                {t("home.donateNow")} →
              </div>
            </motion.div>
          </div>

          {/* ── COL 2: Analyse (center, full height) ── */}
          <motion.div
            onHoverStart={() => setHovered("analyse")}
            onHoverEnd={() => setHovered(null)}
            whileHover={{ y: -2 }}
            style={{
              ...cardBase,
              border: cardBorder("analyse"),
              padding: "26px 22px",
              transition: "border-color 0.3s",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ScanLine active={hovered === "analyse"} />
            <Corners />
            <Pin />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg,rgba(232,160,32,0) 0%,rgba(232,160,32,0.035) 100%)",
                opacity: hovered === "analyse" ? 1 : 0,
                transition: "opacity 0.3s",
                pointerEvents: "none",
              }}
            />

            <p
              style={{
                fontSize: 9,
                letterSpacing: 3,
                color: ACCENT,
                textTransform: "uppercase",
                marginBottom: 16,
                opacity: 0.7,
              }}
            >
              — {t("home.caseFile")} {caseNumber} — Analyse
            </p>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.2,
                marginBottom: 8,
                letterSpacing: "-0.5px",
              }}
            >
              {t("home.analyseHeading")}
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "#454545",
                lineHeight: 1.65,
                marginBottom: 22,
              }}
            >
              {t("home.analyseSubtitle")}
            </p>

            <form
              onSubmit={handleAnalyse}
              style={{ display: "flex", gap: 8, marginBottom: 8 }}
            >
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t("videoInput.placeholder")}
                style={{
                  flex: 1,
                  background: "#080808",
                  border: "1px solid #222",
                  color: "#888",
                  fontFamily: "inherit",
                  fontSize: 12,
                  padding: "9px 12px",
                  outline: "none",
                  minWidth: 0,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = ACCENT;
                  e.target.style.color = "#fff";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#222";
                  e.target.style.color = "#888";
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: ACCENT,
                  border: "none",
                  color: "#000",
                  fontFamily: "inherit",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 2,
                  padding: "9px 16px",
                  cursor: loading ? "wait" : "pointer",
                  textTransform: "uppercase",
                  flexShrink: 0,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "..." : t("videoInput.analyse")}
              </button>
            </form>

            <p
              style={{
                fontSize: 10,
                color: "#2e2e2e",
                letterSpacing: 1,
                marginBottom: 22,
              }}
            >
              {t("hero.trusted").toUpperCase()}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              {[
                { n: "01", label: t("howItWorks.step1Title"), desc: t("howItWorks.step1Desc") },
                { n: "02", label: t("howItWorks.step2Title"), desc: t("howItWorks.step2Desc") },
                { n: "03", label: t("howItWorks.step3Title"), desc: t("howItWorks.step3Desc") },
              ].map(({ n, label, desc }) => (
                <div
                  key={n}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    borderLeft:
                      "2px solid " + (hovered === "analyse" ? ACCENT + "30" : "#1a1a1a"),
                    paddingLeft: 10,
                    transition: "border-color 0.3s",
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      color: ACCENT,
                      letterSpacing: 2,
                      flexShrink: 0,
                      marginTop: 2,
                      fontWeight: 700,
                    }}
                  >
                    {n}
                  </span>
                  <div>
                    <div style={{ fontSize: 11, color: "#666", fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 10, color: "#333", marginTop: 2, lineHeight: 1.45 }}>
                      {desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                position: "absolute",
                bottom: 18,
                right: 18,
                border: "2px solid rgba(232,160,32,0.2)",
                color: "rgba(232,160,32,0.18)",
                fontSize: 10,
                letterSpacing: 3,
                padding: "4px 10px",
                textTransform: "uppercase",
                transform: "rotate(-8deg)",
                fontWeight: 700,
                userSelect: "none",
              }}
            >
              {t("home.classified")}
            </div>
          </motion.div>

          {/* ── COL 3: Clearance + Archive (right, stacked) ── */}
          <div className="dossier-col" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Clearance Levels */}
            <motion.div
              onHoverStart={() => setHovered("pricing")}
              onHoverEnd={() => setHovered(null)}
              whileHover={{ y: -2 }}
              style={{
                ...cardBase,
                border: cardBorder("pricing"),
                padding: "22px 22px",
                cursor: "pointer",
                transition: "border-color 0.3s",
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
              onClick={() => router.push("/pricing")}
            >
              <ScanLine active={hovered === "pricing"} />
              <Corners />
              <Pin />
              <p
                style={{
                  fontSize: 9,
                  letterSpacing: 3,
                  color: ACCENT,
                  textTransform: "uppercase",
                  marginBottom: 12,
                  opacity: 0.7,
                }}
              >
                — {t("home.clearanceLabel")}
              </p>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 6,
                  letterSpacing: "-0.5px",
                }}
              >
                {t("home.clearanceTitle")}
              </h3>
              <p
                style={{
                  fontSize: 11,
                  color: "#3a3a3a",
                  marginBottom: 16,
                  lineHeight: 1.5,
                  flex: 1,
                }}
              >
                {t("home.clearanceSubtitle")}
              </p>
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                {[
                  { nameKey: "pricing.observer", priceKey: "pricing.observerPrice", tierKey: "free", descKey: "home.observerAnalyses" },
                  { nameKey: "pricing.analyst", priceKey: "pricing.analystPrice", tierKey: "analyst", descKey: "home.analystAnalyses" },
                  { nameKey: "pricing.veractor", priceKey: "pricing.veractorPrice", tierKey: "veractor", descKey: "home.veractorAnalyses" },
                ].map(({ nameKey, priceKey, tierKey, descKey }) => {
                  const isActive = tier === tierKey;
                  return (
                    <div
                      key={tierKey}
                      style={{
                        flex: 1,
                        border: "1px solid " + (isActive ? ACCENT : "#1e1e1e"),
                        background: isActive ? "#0d0800" : "transparent",
                        padding: "10px 8px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 8,
                          color: isActive ? ACCENT : "#444",
                          letterSpacing: 2,
                          textTransform: "uppercase",
                          marginBottom: 4,
                        }}
                      >
                        {t(nameKey)}
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: isActive ? ACCENT : "#888",
                          marginBottom: 3,
                        }}
                      >
                        {t(priceKey)}
                      </div>
                      <div style={{ fontSize: 9, color: isActive ? ACCENT + "aa" : "#2a2a2a" }}>
                        {t(descKey)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                style={{ fontSize: 10, letterSpacing: 2, color: ACCENT, textTransform: "uppercase" }}
              >
                {t("home.viewAllPlans")} →
              </div>
            </motion.div>

            {/* Archive */}
            <motion.div
              onHoverStart={() => setHovered("history")}
              onHoverEnd={() => setHovered(null)}
              whileHover={{ y: -2 }}
              style={{
                ...cardBase,
                border: cardBorder("history"),
                padding: "22px 22px",
                cursor: "pointer",
                transition: "border-color 0.3s",
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
              onClick={() => router.push("/history")}
            >
              <ScanLine active={hovered === "history"} />
              <Corners />
              <Pin />
              <p
                style={{
                  fontSize: 9,
                  letterSpacing: 3,
                  color: ACCENT,
                  textTransform: "uppercase",
                  marginBottom: 12,
                  opacity: 0.7,
                }}
              >
                — {t("home.archiveLabel")}
              </p>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 6,
                  letterSpacing: "-0.5px",
                }}
              >
                {t("home.archiveTitle")}
              </h3>
              <p style={{ fontSize: 11, color: "#3a3a3a", marginBottom: 14, lineHeight: 1.5 }}>
                {analyses.length > 0
                  ? t("home.investigationsRecord", { count: analyses.length })
                  : t("home.archiveSubtitle")}
              </p>
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                {archiveRows.map(({ label, time }, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: i < archiveRows.length - 1 ? "1px solid #111" : "none",
                      gap: 8,
                    }}
                  >
                    {label ? (
                      <span
                        style={{
                          fontSize: 11,
                          color: "#444",
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {label}
                      </span>
                    ) : (
                      <Redacted width={100 + (i * 15) % 50} />
                    )}
                    <span style={{ fontSize: 9, color: "#2e2e2e", letterSpacing: 1, flexShrink: 0 }}>
                      {time}
                    </span>
                  </div>
                ))}
              </div>
              <div
                style={{ marginTop: 12, fontSize: 10, letterSpacing: 2, color: ACCENT, textTransform: "uppercase" }}
              >
                {t("home.openArchive")} →
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
