"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function Nav() {
  const { dict, locale, setLocale } = useLocale();

  return (
    <header className="h-[82px] flex items-center justify-between gap-3 relative z-10 w-[min(1180px,calc(100%-24px))] sm:w-[min(1180px,calc(100%-40px))] mx-auto">
      <Link href="#top" aria-label="RAWI home" className="flex min-w-0 items-center gap-2 font-extrabold">
        <span className="w-[30px] h-[30px] shrink-0 rounded-[50%_50%_50%_8px] bg-rawi-yellow grid place-items-center text-black font-black -rotate-[8deg]">
          R
        </span>
        <span className="text-[18px] tracking-[0.1em] sm:text-[19px] sm:tracking-[0.12em] text-[#f5f5f0]">RAWI</span>
        <span className="font-arabic text-xs text-white/35">راوي</span>
      </Link>

      <nav className="hidden md:flex gap-8 text-sm text-white/60" aria-label="Primary navigation">
        <a href="#features" className="hover:text-rawi-yellow transition-colors">{dict.nav.features}</a>
        <a href="#gallery" className="hover:text-rawi-yellow transition-colors">{dict.nav.gallery}</a>
        <a href="#pricing" className="hover:text-rawi-yellow transition-colors">{dict.nav.pricing}</a>
      </nav>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-[13px] font-extrabold tracking-[0.03em] sm:tracking-[0.04em]" aria-label="Language selector">
          <button
            type="button"
            onClick={() => setLocale("ar")}
            aria-pressed={locale === "ar"}
            className={`transition-colors ${locale === "ar" ? "text-rawi-yellow" : "text-white/35 hover:text-white/70"}`}
          >
            AR
          </button>
          <span className="text-white/20 font-medium">/</span>
          <button
            type="button"
            onClick={() => setLocale("en")}
            aria-pressed={locale === "en"}
            className={`transition-colors ${locale === "en" ? "text-rawi-yellow" : "text-white/35 hover:text-white/70"}`}
          >
            ENG
          </button>
        </div>
        <Link
          href="/login"
          className="bg-rawi-yellow text-black font-extrabold rounded-full px-3 sm:px-[15px] py-[9px] sm:py-[10px] text-xs sm:text-sm shadow-[0_8px_24px_rgba(255,212,0,0.22)] hover:-translate-y-px transition-transform inline-flex items-center"
        >
          {dict.nav.open}
        </Link>
      </div>
    </header>
  );
}
