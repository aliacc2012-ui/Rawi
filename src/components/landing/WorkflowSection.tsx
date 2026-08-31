"use client";

import { useRef, useEffect, useState } from "react";

const WORKFLOW = [
  {
    number: "01",
    title: "Upload",
    body: "Drag in your final photos and films. Files up to 500 MB, no compression, no watermarks.",
    icon: "↥",
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.20)",
  },
  {
    number: "02",
    title: "Customize",
    body: "Add your studio logo, accent color and a cinematic cover. Your brand, front and center.",
    icon: "✦",
    color: "#FFD400",
    glow: "rgba(255,212,0,0.20)",
  },
  {
    number: "03",
    title: "Share",
    body: "One link. Send it on WhatsApp, email, or embed it anywhere. Password-protect optional.",
    icon: "↗",
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.20)",
  },
  {
    number: "04",
    title: "Deliver",
    body: "Clients browse, favorite their picks, leave feedback and download. Zero friction.",
    icon: "✓",
    color: "#10b981",
    glow: "rgba(16,185,129,0.20)",
  },
] as const;

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export function WorkflowSection() {
  const { ref, visible } = useInView();

  return (
    <section
      aria-labelledby="rawi-workflow-title"
      className="relative z-10 overflow-hidden bg-[#06060F] py-[72px] md:py-[100px]"
    >
      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px]" />

      {/* Yellow ambient glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-rawi-yellow/[.04] blur-[120px]" />

      <div ref={ref} className="relative mx-auto w-[min(1180px,calc(100%-32px))] md:w-[min(1180px,calc(100%-40px))]">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="h-[1px] w-8 bg-rawi-yellow" />
          <span className="font-montserrat text-[10px] font-extrabold tracking-[.25em] text-white/30 uppercase">From export to delivery</span>
        </div>
        <h2
          id="rawi-workflow-title"
          className="font-cormorant text-[42px] md:text-[64px] leading-[1.02] tracking-[-0.03em] text-white mb-14 md:mb-20"
        >
          How RAWI works.
        </h2>

        {/* Cards with connecting rail */}
        <ol className="relative grid list-none gap-0 p-0 sm:grid-cols-2 lg:grid-cols-4">

          {/* Connecting line (desktop) */}
          <div className="pointer-events-none absolute top-[52px] left-[80px] right-[80px] h-[1px] hidden lg:block">
            <div
              className="h-full bg-gradient-to-r from-transparent via-white/[.12] to-transparent"
              style={{
                transform: visible ? "scaleX(1)" : "scaleX(0)",
                transformOrigin: "left",
                transition: "transform 1.2s ease 0.4s",
              }}
            />
          </div>

          {WORKFLOW.map((step, index) => (
            <li
              key={step.number}
              className="relative group flex flex-col"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.6s ease ${0.15 + index * 0.15}s, transform 0.6s ease ${0.15 + index * 0.15}s`,
              }}
            >
              {/* Step node */}
              <div className="flex items-center gap-4 mb-7 px-5 lg:px-6">
                <div
                  className="relative w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0 z-10 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `radial-gradient(circle at center, ${step.glow.replace("0.20", "0.3")} 0%, transparent 70%)`,
                    border: `1px solid ${step.color}40`,
                    boxShadow: `0 0 20px ${step.glow}`,
                  }}
                >
                  <span
                    className="font-cormorant text-[22px] font-bold"
                    style={{ color: step.color }}
                  >
                    {step.number}
                  </span>
                </div>
              </div>

              {/* Card */}
              <div
                className="flex-1 mx-2 lg:mx-3 rounded-[22px] border p-6 transition-all duration-400 group-hover:-translate-y-2"
                style={{
                  borderColor: "rgba(255,255,255,0.07)",
                  background: "#0C0C1A",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${step.color}30`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px ${step.glow}, 0 20px 48px rgba(0,0,0,0.4)`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.3)";
                }}
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-base mb-5 transition-colors duration-300 group-hover:scale-110"
                  style={{ background: `${step.color}18`, color: step.color }}
                >
                  {step.icon}
                </div>

                <h3 className="font-cormorant text-[28px] tracking-[-0.02em] text-white mb-3">
                  {step.title}
                </h3>
                <p className="font-montserrat text-[13px] leading-[1.7] text-white/40">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
