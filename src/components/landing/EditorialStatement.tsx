"use client";
import { Reveal } from "@/components/landing/Reveal";

export function EditorialStatement() {
  return (
    <section className="relative overflow-hidden bg-[#06060F] py-[52px] md:py-[80px]">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ background: "radial-gradient(ellipse 60% 50% at 20% 60%, rgba(201,150,42,.12), transparent)" }}
        aria-hidden="true"
      />
      <div className="relative mx-auto w-[min(1180px,calc(100%-32px))] md:w-[min(1180px,calc(100%-40px))]">
        <span className="font-cormorant pointer-events-none absolute -top-6 right-0 hidden select-none text-[220px] leading-none text-white/[.025] lg:block" aria-hidden="true">01</span>
        <Reveal><div className="editorial-eyebrow mb-10" style={{ color: "#C9962A" }}>The Standard</div></Reveal>
        <Reveal delay={1}>
          <h2 className="display-section mb-8 max-w-[860px] text-[#F2ECD8]">
            Your work is{" "}
            <em className="not-italic" style={{ color: "#C9962A" }}>exceptional.</em>
            <br />
            Your delivery should be too.
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <div className="gold-rule mb-8" aria-hidden="true" style={{ opacity: 0.5 }} />
        </Reveal>
        <Reveal delay={3}>
          <p className="font-montserrat max-w-[560px] text-[17px] font-light leading-relaxed text-white/40">
            Most UAE photographers send a Google Drive link. Their clients download files in a chaotic folder — no context, no brand, no experience. RAWI changes the delivery, not the work.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
