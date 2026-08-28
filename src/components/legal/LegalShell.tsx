import Link from "next/link";
import type { ReactNode } from "react";

export function LegalShell({ eyebrow, title, updated, children }: { eyebrow: string; title: string; updated: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#fbf6ef] px-4 py-8 text-[#111] md:px-6 md:py-14">
      <div className="mx-auto max-w-[920px]">
        <Link href="/" className="inline-flex items-center gap-2 font-black tracking-[.12em]">
          <span className="grid h-10 w-10 -rotate-[8deg] place-items-center rounded-[50%_50%_50%_8px] bg-rawi-yellow text-sm">R</span>
          RAWI
        </Link>
        <article className="mt-8 rounded-[28px] border border-black/10 bg-white px-5 py-8 shadow-[0_24px_80px_rgba(55,42,24,.07)] md:px-12 md:py-12">
          <p className="text-[11px] font-extrabold tracking-[.17em] text-gray-500">{eyebrow}</p>
          <h1 className="mt-3 text-[42px] font-medium leading-[1] tracking-[-.055em] md:text-[68px]">{title}</h1>
          <p className="mt-4 text-sm text-gray-500">Last updated: {updated}</p>
          <div className="legal-copy mt-10 space-y-9 text-[15px] leading-7 text-gray-700 [&_a]:font-semibold [&_a]:text-black [&_a]:underline [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-[-.03em] [&_li]:mb-2 [&_ul]:list-disc [&_ul]:pl-5">
            {children}
          </div>
        </article>
        <footer className="flex flex-wrap items-center justify-between gap-4 px-2 py-7 text-xs text-gray-500">
          <span>© 2026 RAWI • راوي</span>
          <nav className="flex gap-5" aria-label="Legal">
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <a href="mailto:ali.acc2012@gmail.com">Contact</a>
          </nav>
        </footer>
      </div>
    </main>
  );
}
