"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function Nav() {
  const { dict, toggleLocale } = useLocale();

  return (
    <header className="h-[82px] flex items-center justify-between gap-6 relative z-10 w-[min(1180px,calc(100%-40px))] mx-auto">
      <Link href="#top" aria-label="RAWI home" className="flex items-center gap-2.5 font-extrabold">
        <span className="w-[30px] h-[30px] rounded-[50%_50%_50%_8px] bg-rawi-yellow grid place-items-center text-black font-black -rotate-[8deg]">
          R
        </span>
        <span className="text-[19px] tracking-[0.12em]">RAWI</span>
        <span className="font-arabic text-xs text-gray-500 hidden sm:inline">راوي</span>
      </Link>

      <nav className="hidden md:flex gap-8 text-sm" aria-label="Primary navigation">
        <a href="#features" className="hover:opacity-55 transition-opacity">{dict.nav.features}</a>
        <a href="#gallery" className="hover:opacity-55 transition-opacity">{dict.nav.gallery}</a>
        <a href="#pricing" className="hover:opacity-55 transition-opacity">{dict.nav.pricing}</a>
      </nav>

      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={toggleLocale}
          className="hidden sm:inline-flex border border-gray-300 rounded-full px-[19px] py-[13px] hover:bg-gray-50 transition-colors"
        >
          {dict.nav.switch}
        </button>
        <Link
          href="/login"
          className="bg-rawi-yellow text-black font-extrabold rounded-full px-[15px] py-[10px] text-sm shadow-[0_8px_24px_rgba(255,212,0,0.18)] hover:-translate-y-px transition-transform inline-flex items-center"
        >
          {dict.nav.open}
        </Link>
      </div>
    </header>
  );
}
