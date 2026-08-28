import { Hero, Strip, GalleryDemo, Pricing, ClosingCTA } from "@/components/landing/Sections";
import { EnhancedFeatures } from "@/components/landing/EnhancedFeatures";

export default function LandingPage() {
  return (
    <main id="top">
      <Hero />
      <Strip />
      <EnhancedFeatures />
      <GalleryDemo />
      <Pricing />
      <ClosingCTA />
    </main>
  );
}
