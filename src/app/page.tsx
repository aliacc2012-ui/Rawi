import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import {
  Hero,
  Strip,
  GalleryDemo,
  Pricing,
  ClosingCTA,
} from "@/components/landing/Sections";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { EnhancedFeatures } from "@/components/landing/EnhancedFeatures";
import { Stats } from "@/components/landing/Stats";
import { EditorialStatement } from "@/components/landing/EditorialStatement";
import { FAQ } from "@/components/landing/FAQ";
import { Testimonials } from "@/components/landing/Testimonials";
import { CookieConsent } from "@/components/landing/CookieConsent";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: "RAWI — Cinematic Client Galleries for Photographers & Filmmakers",
  description:
    "RAWI is the UAE-first gallery platform for photographers and filmmakers. Branded client galleries, resumable uploads up to 500 MB, WhatsApp sharing, and full Arabic + English support. Start free — no credit card required.",
  keywords: [
    "client gallery",
    "photographer platform",
    "UAE photographer",
    "Arabic photography app",
    "photo delivery",
    "video delivery",
    "branded gallery",
    "filmmaker gallery",
    "RAW file delivery",
  ],
  openGraph: {
    title: "RAWI — Your work deserves better than a Drive link.",
    description:
      "Cinematic, branded client galleries for photographers and filmmakers. Bilingual Arabic & English. Built for the UAE.",
    type: "website",
    locale: "en_AE",
    alternateLocale: "ar_AE",
  },
  twitter: {
    card: "summary_large_image",
    title: "RAWI — Cinematic Client Galleries",
    description:
      "UAE-first gallery platform for photographers and filmmakers. Start free.",
  },
};

export default function LandingPage() {
  return (
    <main id="top" className="grain-overlay relative overflow-hidden bg-[#06060F] text-[#F0EFFF]">
      {/* Ambient glow blobs */}
      <div className="blob-a" aria-hidden="true" />
      <div className="blob-b" aria-hidden="true" />
      <div className="blob-c" aria-hidden="true" />

      <Nav />
      <Hero />
      <Strip />
      <Stats />
      <WorkflowSection />
      <GalleryDemo />
      <Testimonials />
      <EditorialStatement />
      <EnhancedFeatures />
      <Pricing />
      <FAQ />
      <ClosingCTA />

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/8 bg-[#04040C]">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))] md:w-[min(1180px,calc(100%-40px))] py-10 md:py-14">
          {/* Top row */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link href="#top" className="inline-flex items-center gap-2 font-extrabold">
                <span className="grid h-8 w-8 shrink-0 -rotate-[8deg] place-items-center rounded-[50%_50%_50%_8px] bg-rawi-yellow text-sm font-black text-black">
                  R
                </span>
                <span className="text-lg tracking-[0.1em] text-[#F0EFFF]">RAWI</span>
                <span className="font-arabic text-xs text-white/35">راوي</span>
              </Link>
              <p className="mt-3 max-w-[320px] text-sm leading-relaxed text-white/45">
                Cinematic, branded client galleries for photographers and filmmakers. Built in the UAE, made for creators everywhere.
              </p>
              {/* Social */}
              <div className="mt-5 flex gap-3">
                <a href="https://instagram.com/rawi.gallery" target="_blank" rel="noopener noreferrer" aria-label="RAWI on Instagram"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-sm text-white/50 transition hover:border-rawi-yellow hover:text-rawi-yellow">
                  IG
                </a>
                <a href="https://x.com/rawiapp" target="_blank" rel="noopener noreferrer" aria-label="RAWI on X"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-sm text-white/50 transition hover:border-rawi-yellow hover:text-rawi-yellow">
                  𝕏
                </a>
                <a href="https://linkedin.com/company/rawiapp" target="_blank" rel="noopener noreferrer" aria-label="RAWI on LinkedIn"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-sm text-white/50 transition hover:border-rawi-yellow hover:text-rawi-yellow">
                  in
                </a>
              </div>
            </div>

            {/* Product */}
            <nav aria-label="Product links">
              <div className="mb-4 text-[11px] font-extrabold tracking-[0.14em] text-white/30">PRODUCT</div>
              <ul className="space-y-3 text-sm text-white/55">
                <li><a href="#features" className="hover:text-rawi-yellow transition-colors">Features</a></li>
                <li><a href="#gallery" className="hover:text-rawi-yellow transition-colors">Gallery Demo</a></li>
                <li><a href="#pricing" className="hover:text-rawi-yellow transition-colors">Pricing</a></li>
                <li><Link href="/demo/today-drive" className="hover:text-rawi-yellow transition-colors">Live Demo</Link></li>
              </ul>
            </nav>

            {/* Company */}
            <nav aria-label="Company links">
              <div className="mb-4 text-[11px] font-extrabold tracking-[0.14em] text-white/30">COMPANY</div>
              <ul className="space-y-3 text-sm text-white/55">
                <li><Link href="/support" className="hover:text-rawi-yellow transition-colors">Support</Link></li>
                <li><Link href="/terms" className="hover:text-rawi-yellow transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-rawi-yellow transition-colors">Privacy Policy</Link></li>
              </ul>
            </nav>
          </div>

          {/* Bottom row */}
          <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/8 pt-6 text-xs text-white/30 sm:flex-row sm:items-center">
            <span>© 2026 RAWI • راوي. All rights reserved.</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rawi-yellow" />
              Made with pride in the UAE 🇦🇪
            </span>
          </div>
        </div>
      </footer>

      <CookieConsent />
    </main>
  );
}
