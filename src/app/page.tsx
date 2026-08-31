import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import {
  Hero,
  Strip,
  GalleryDemo,
  Pricing,
} from "@/components/landing/Sections";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { EnhancedFeatures } from "@/components/landing/EnhancedFeatures";
import { Stats } from "@/components/landing/Stats";
import { FAQ } from "@/components/landing/FAQ";
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
    <main id="top">
      <Nav />
      <Hero />
      <Strip />
      <Stats />
      <WorkflowSection />
      <EnhancedFeatures />
      <GalleryDemo />
      <Pricing />
      <FAQ />
      {/* Footer */}
      <footer className="border-t border-black/10 bg-[#fbf6ef]">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))] md:w-[min(1180px,calc(100%-40px))] py-10 md:py-14">
          {/* Top row */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link href="#top" className="inline-flex items-center gap-2 font-extrabold">
                <span className="grid h-8 w-8 shrink-0 -rotate-[8deg] place-items-center rounded-[50%_50%_50%_8px] bg-rawi-yellow text-sm font-black text-black">
                  R
                </span>
                <span className="text-lg tracking-[0.1em]">RAWI</span>
                <span className="font-arabic text-xs text-gray-400">راوي</span>
              </Link>
              <p className="mt-3 max-w-[320px] text-sm leading-relaxed text-gray-500">
                Cinematic, branded client galleries for photographers and filmmakers. Built in the UAE, made for creators everywhere.
              </p>
              {/* Social */}
              <div className="mt-5 flex gap-3">
                <a
                  href="https://instagram.com/rawi.gallery"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="RAWI on Instagram"
                  className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 bg-white text-sm text-gray-600 transition hover:border-black hover:text-black"
                >
                  IG
                </a>
                <a
                  href="https://x.com/rawiapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="RAWI on X"
                  className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 bg-white text-sm text-gray-600 transition hover:border-black hover:text-black"
                >
                  𝕏
                </a>
                <a
                  href="https://linkedin.com/company/rawiapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="RAWI on LinkedIn"
                  className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 bg-white text-sm text-gray-600 transition hover:border-black hover:text-black"
                >
                  in
                </a>
              </div>
            </div>

            {/* Product */}
            <nav aria-label="Product links">
              <div className="mb-4 text-[11px] font-extrabold tracking-[0.14em] text-gray-400">
                PRODUCT
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#features" className="hover:text-black transition-colors">Features</a></li>
                <li><a href="#gallery" className="hover:text-black transition-colors">Gallery Demo</a></li>
                <li><a href="#pricing" className="hover:text-black transition-colors">Pricing</a></li>
                <li><Link href="/demo/today-drive" className="hover:text-black transition-colors">Live Demo</Link></li>
              </ul>
            </nav>

            {/* Company */}
            <nav aria-label="Company links">
              <div className="mb-4 text-[11px] font-extrabold tracking-[0.14em] text-gray-400">
                COMPANY
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><Link href="/support" className="hover:text-black transition-colors">Support</Link></li>
                <li><Link href="/terms" className="hover:text-black transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
              </ul>
            </nav>
          </div>

          {/* Bottom row */}
          <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-black/8 pt-6 text-xs text-gray-400 sm:flex-row sm:items-center">
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
