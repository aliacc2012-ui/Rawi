import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Hero, Strip, GalleryDemo, Pricing, ClosingCTA } from "@/components/landing/Sections";
import { EnhancedFeatures } from "@/components/landing/EnhancedFeatures";

export default function LandingPage() {
  return (
    <main id="top">
      <Nav />
      <Hero />
      <Strip />
      <EnhancedFeatures />
      <GalleryDemo />
      <Pricing />
      <ClosingCTA />
      <footer className="border-t border-black/10 bg-[#fbf6ef] px-5 py-8">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 RAWI • راوي</span>
          <nav className="flex flex-wrap gap-5" aria-label="Legal and support">
            <Link href="/terms" className="hover:text-black">Terms</Link>
            <Link href="/privacy" className="hover:text-black">Privacy</Link>
            <Link href="/support" className="hover:text-black">Support</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
