"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import {
  RiCloseLine,
  RiDashboardLine,
  RiGlobalLine,
  RiHome4Line,
  RiMenuLine,
  RiStore2Line,
} from "react-icons/ri";
import { FaHeart } from "react-icons/fa";
import Link from "next/link";
import { useFavoritesStore } from "@/stores";
import {
  Show,
  UserButton,
  SignInButton,
  SignUpButton,
  useUser,
} from "@clerk/nextjs";

export function NewNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [language, setLanguage] = useState<"EN" | "FR">("EN");
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { favorites } = useFavoritesStore();
  const { user } = useUser();
  const isPartner = user?.unsafeMetadata?.role === "partner";
  const hasFavorites = mounted && favorites.length > 0;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 h-24 sm:h-28 z-50 transition-all duration-300 ${
          scrolled || mobileMenuOpen ? "bg-[var(--glass-bg)] backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0" onClick={() => setMobileMenuOpen(false)}>
            <motion.img
              src="/Reserve237-logo.png"
              alt="Reserve237"
              className="h-20 sm:h-24 md:h-28 w-auto max-w-[150px] sm:max-w-[190px] md:max-w-[220px] object-contain drop-shadow-[0_2px_8px_rgba(31,42,42,0.3)]"
              initial={{ opacity: 0, scale: 0.5, rotate: -12, y: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 190,
                damping: 14,
                delay: 0.15,
              }}
              whileHover={{ scale: 1.06, rotate: -2 }}
              draggable={false}
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors text-sm">
              Home
            </Link>
            <Link href="/business" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors text-sm">
              For Business
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === "EN" ? "FR" : "EN")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-[var(--secondary)] transition-colors"
            >
              <RiGlobalLine className="w-4 h-4" />
              <span className="text-sm font-medium">{language}</span>
            </button>

            {/* Favorites */}
            <Link
              href="/favorites"
              className="relative p-2.5 rounded-lg hover:bg-[var(--secondary)] transition-colors"
              title="My Favorites"
              onClick={() => setMobileMenuOpen(false)}
            >
              {hasFavorites ? (
                <FaHeart className="w-5 h-5 text-[var(--primary)]" />
              ) : (
                <FaHeart className="w-5 h-5 text-[var(--muted-foreground)]" />
              )}
              {hasFavorites && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[var(--primary)] text-[var(--primary-foreground)] text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {favorites.length > 9 ? "9+" : favorites.length}
                </span>
              )}
            </Link>

            {/* Auth */}
            <div className="hidden md:flex items-center gap-2">
              <Show when="signed-out">
                <SignInButton mode="redirect" fallbackRedirectUrl="/">
                  <button className="text-sm font-medium px-3 py-2 rounded-lg hover:bg-[var(--secondary)] transition-colors text-[var(--foreground)]">
                    Login
                  </button>
                </SignInButton>
                <SignUpButton mode="redirect" fallbackRedirectUrl="/">
                  <button className="btn-primary text-sm">
                    Sign Up
                  </button>
                </SignUpButton>
              </Show>
            </div>

            <Show when="signed-in">
              {isPartner && (
                <Link
                  href="/dashboard"
                  className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors"
                  title="Go to dashboard"
                >
                  <RiDashboardLine className="w-4 h-4" />
                  Dashboard
                </Link>
              )}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9",
                  },
                }}
              />
            </Show>

            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="md:hidden p-2.5 rounded-lg hover:bg-[var(--secondary)] transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <RiCloseLine className="w-5 h-5" />
              ) : (
                <RiMenuLine className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-[#1F2A2A]/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="mx-4 mt-28 rounded-3xl border border-[var(--glass-border)] bg-[var(--card)] p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[var(--foreground)] hover:bg-[var(--secondary)]"
              >
                <RiHome4Line className="w-5 h-5 text-[var(--primary)]" />
                Home
              </Link>
              <Link
                href="/business"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[var(--foreground)] hover:bg-[var(--secondary)]"
              >
                <RiStore2Line className="w-5 h-5 text-[var(--primary)]" />
                For Business
              </Link>
              <Link
                href="/favorites"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[var(--foreground)] hover:bg-[var(--secondary)]"
              >
                <FaHeart className={hasFavorites ? "w-5 h-5 text-[var(--primary)]" : "w-5 h-5 text-[var(--muted-foreground)]"} />
                Favorites
                {hasFavorites && (
                  <span className="ml-auto rounded-full bg-[var(--primary)] px-2 py-0.5 text-xs font-bold text-[var(--primary-foreground)]">
                    {favorites.length}
                  </span>
                )}
              </Link>
              {isPartner && (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[var(--foreground)] hover:bg-[var(--secondary)]"
                >
                  <RiDashboardLine className="w-5 h-5 text-[var(--primary)]" />
                  Dashboard
                </Link>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
              <button
                onClick={() => setLanguage(language === "EN" ? "FR" : "EN")}
                className="flex items-center gap-2 rounded-2xl bg-[var(--secondary)] px-4 py-3 text-sm font-medium"
              >
                <RiGlobalLine className="w-4 h-4" />
                {language}
              </button>

              <Show when="signed-out">
                <div className="flex flex-1 justify-end gap-2">
                  <SignInButton mode="redirect" fallbackRedirectUrl="/">
                    <button className="btn-secondary px-4 py-3 text-sm">Login</button>
                  </SignInButton>
                  <SignUpButton mode="redirect" fallbackRedirectUrl="/">
                    <button className="btn-primary px-4 py-3 text-sm">Sign Up</button>
                  </SignUpButton>
                </div>
              </Show>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
