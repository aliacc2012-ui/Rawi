"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

const stats = [
  {
    value_en: "UAE-born", label_en: "Built for this region", label_ar: "صُنع لهذه المنطقة",
    value_ar: "صُنع هنا", color: "#8b5cf6", glow: "rgba(139,92,246,0.18)",
  },
  {
    value_en: "2024", label_en: "Launched in the UAE", label_ar: "أُطلق في الإمارات",
    value_ar: "2024", color: "#06b6d4", glow: "rgba(6,182,212,0.15)",
  },
  {
    value_en: "500 MB", label_en: "Max file size", label_ar: "أقصى حجم للملف",
    value_ar: "500 ميغا", color: "#FFD400", glow: "rgba(255,212,0,0.18)",
  },
  {
    value_en: "100%", label_en: "Arabic + English", label_ar: "عربي وإنجليزي",
    value_ar: "100%", color: "#10b981", glow: "rgba(16,185,129,0.15)",
  },
];

export function Stats() {
  const { locale } = useLocale();
  const isAr = locale === "ar";

  return (
    <section aria-label="Platform highlights" className="relative z-10 bg-[#08080F] py-14 md:py-20 overflow-hidden">
      {/* subtle dot grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[.025]"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "36px 36px" }} />

      <div className="relative mx-auto w-[min(1180px,calc(100%-32px))] md:w-[min(1180px,calc(100%-40px))]">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-10 md:mb-14">
          <span className="h-[1px] w-8 bg-rawi-yellow" />
          <span className="font-montserrat text-[10px] font-extrabold tracking-[.25em] text-white/30 uppercase">Built different</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[.05] rounded-[24px] overflow-hidden">
          {stats.map((s, i) => (
            <div
              key={i}
              className="group relative flex flex-col justify-between p-7 md:p-9 bg-[#08080F] hover:bg-[#0d0d1a] transition-colors duration-300"
            >
              {/* per-stat inner glow */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(ellipse at bottom left, ${s.glow} 0%, transparent 65%)` }}
              />
              {/* value */}
              <span
                className="font-cormorant text-[56px] md:text-[72px] leading-none tracking-tight font-bold"
                style={{ color: s.color }}
              >
                {isAr ? s.value_ar : s.value_en}
              </span>
              {/* label */}
              <span className="font-montserrat text-[11px] font-bold tracking-[.15em] uppercase text-white/35 mt-4 leading-relaxed">
                {isAr ? s.label_ar : s.label_en}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
