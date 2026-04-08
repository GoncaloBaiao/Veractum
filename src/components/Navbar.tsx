"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSelector } from "@/components/LanguageSelector";

export function Navbar() {
  const t = useTranslations("nav");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  return (
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
          <Link
            href="/api/auth/signin"
            className="text-sm text-gray-400 hover:text-gray-100 transition-colors px-4 py-2"
          >
            {t("signIn")}
          </Link>
          <Link
            href="/#hero"
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl px-6 py-2.5 text-sm transition-all hover:shadow-lg hover:shadow-amber-500/25"
          >
            {t("tryFree")}
          </Link>
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
            <Link
              href="/api/auth/signin"
              className="text-gray-400 hover:text-gray-100 transition-colors py-2"
              onClick={() => setIsMobileOpen(false)}
            >
              {t("signIn")}
            </Link>
            <Link
              href="/#hero"
              onClick={() => setIsMobileOpen(false)}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl px-6 py-3 text-sm text-center transition-all"
            >
              {t("tryFree")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
