import { Nav } from "@/components/landing/Nav";
import { Hero, Strip, Features, GalleryDemo, Pricing, ClosingCTA } from "@/components/landing/Sections";

export default function LandingPage() {
  return (
    <main id="top">
      <Nav />
      <Hero />
      <Strip />
      <Features />
      <GalleryDemo />
      <Pricing />
      <ClosingCTA />
    </main>
  );
}
