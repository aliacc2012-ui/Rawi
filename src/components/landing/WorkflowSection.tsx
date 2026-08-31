"use client";

import { Reveal } from "@/components/landing/Reveal";

const WORKFLOW = [
  { number: "01", title: "Upload", body: "Add your final photos and films.", icon: "↥" },
  { number: "02", title: "Customize", body: "Apply your studio identity.", icon: "✦" },
  { number: "03", title: "Share", body: "Send one polished gallery link.", icon: "↗" },
  { number: "04", title: "Deliver", body: "Clients preview, select and download.", icon: "✓" },
] as const;

export function WorkflowSection() {
  return (
    <section
      aria-labelledby="rawi-workflow-title"
      className="relative z-10 overflow-hidden bg-[#06060F] py-[72px] md:py-[100px]"
    >
      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="relative mx-auto w-[min(1180px,calc(100%-32px))] md:w-[min(1180px,calc(100%-40px))]">
        <Reveal>
          <div className="mb-8 md:mb-10">
            <span className="text-[11px] font-extrabold tracking-[.17em] text-white/35">
              FROM EXPORT TO DELIVERY
            </span>
            <h2
              id="rawi-workflow-title"
              className="mt-3 text-[36px] leading-[1.02] tracking-[-.05em] text-[#F0EFFF] md:text-[58px]"
            >
              How RAWI works.
            </h2>
          </div>
        </Reveal>

        <ol className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {WORKFLOW.map((step, index) => (
            <Reveal key={step.number} delay={index * 100}>
              <li
                className="group relative min-h-[230px] rounded-[24px] border border-white/8 bg-[#0C0C1A] p-6 shadow-[0_12px_35px_rgba(0,0,0,.4)] transition duration-300 hover:-translate-y-1.5 hover:border-rawi-yellow/20 hover:shadow-[0_0_40px_rgba(255,212,0,0.06),0_20px_50px_rgba(0,0,0,.5)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-[15px] bg-rawi-yellow text-sm font-black text-black">
                    {step.number}
                  </span>
                  <span
                    aria-hidden="true"
                    className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-lg text-white/30 transition group-hover:bg-rawi-yellow group-hover:text-black"
                  >
                    {step.icon}
                  </span>
                </div>
                <h3 className="mt-10 text-xl font-extrabold uppercase tracking-[-.02em] text-[#F0EFFF]">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-[230px] text-sm leading-6 text-white/45">
                  {step.body}
                </p>
                {index < WORKFLOW.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1/2 -right-[22px] z-10 hidden -translate-y-1/2 text-2xl font-light text-white/20 lg:block"
                  >
                    →
                  </span>
                )}
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
