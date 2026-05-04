"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Menu, X, LogOut, User, Crown } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSelector } from "@/components/LanguageSelector";
import { LoginModal } from "@/components/LoginModal";

const TIER_BADGES: Record<string, { label: string; color: string }> = {
  free: { label: "Observer", color: "text-gray-400 bg-gray-800" },
  analyst: { label: "Analyst", color: "text-amber-400 bg-amber-500/10" },
  veractor: { label: "Veractor", color: "text-purple-400 bg-purple-500/10" },
};

export function Navbar() {
  const t = useTranslations("nav");
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const tier = (session?.user as { tier?: string } | undefined)?.tier ?? "free";
  const badge = TIER_BADGES[tier] ?? TIER_BADGES.free;

  const navLinks = [
    { label: t("howItWorks"), href: "/#how-it-works" },
    { label: t("pricing"), href: "/pricing" },
    { label: t("history"), href: "/history" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0a0a0f]/80 backdrop-blur-md border-b border-gray-800/50"
          : "bg-transparent"
      }`}
    >
      <nav className="page-container flex items-center justify-between h-16 sm:h-20">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="Veractum home"
        >
          <BrandLogo size="md" />
          <span className="text-xl font-bold tracking-tight text-gray-100 group-hover:text-amber-400 transition-colors">
            Veractum
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-400 hover:text-gray-100 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSelector />
          {session?.user ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label="User menu"
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-800/50 transition-colors"
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <User size={16} className="text-amber-400" />
                  </div>
                )}
                <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border border-current/20 ${badge.color}`}>
                  <Crown size={9} />
                  {badge.label}
                </span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-800 rounded-xl shadow-xl shadow-black/30 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-800">
                    <p className="text-sm font-medium text-gray-200 truncate">{session.user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                    <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                      <Crown size={10} />
                      {badge.label}
                    </span>
                  </div>
                  <button
                    onClick={() => { setShowUserMenu(false); void signOut(); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800/50 hover:text-gray-100 transition-colors"
                  >
                    <LogOut size={14} />
                    {t("signOut")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowLogin(true)}
                className="text-sm text-gray-400 hover:text-gray-100 transition-colors px-4 py-2"
              >
                {t("signIn")}
              </button>
              <Link
                href="/#hero"
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl px-6 py-2.5 text-sm transition-all hover:shadow-lg hover:shadow-amber-500/25"
              >
                {t("tryFree")}
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="md:hidden p-2 text-gray-400 hover:text-gray-100 transition-colors"
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-[#0a0a0f]/95 backdrop-blur-md border-b border-gray-800/50">
          <div className="page-container py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className="text-gray-400 hover:text-gray-100 transition-colors py-2"
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-gray-800" />
            <div className="py-2">
              <LanguageSelector />
            </div>
            {session?.user ? (
              <>
                <div className="flex items-center gap-3 py-2">
                  {session.user.image ? (
                    <Image src={session.user.image} alt="" width={28} height={28} className="rounded-full" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <User size={14} className="text-amber-400" />
                    </div>
                  )}
                  <span className="text-sm text-gray-300">{session.user.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>
                </div>
                <button
                  onClick={() => { setIsMobileOpen(false); void signOut(); }}
                  className="flex items-center gap-2 text-gray-400 hover:text-gray-100 transition-colors py-2"
                >
                  <LogOut size={14} />
                  {t("signOut")}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setIsMobileOpen(false); setShowLogin(true); }}
                  className="text-gray-400 hover:text-gray-100 transition-colors py-2 text-left"
                >
                  {t("signIn")}
                </button>
                <Link
                  href="/#hero"
                  onClick={() => setIsMobileOpen(false)}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl px-6 py-3 text-sm text-center transition-all"
                >
                  {t("tryFree")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>

    <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
