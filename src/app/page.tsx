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
    </main>
  );
}
