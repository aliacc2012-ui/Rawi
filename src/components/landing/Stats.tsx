"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const stats = [
  {
    num: 500, suffix: "+", label_en: "Creators in the UAE", label_ar: "مبدع في الإمارات",
    value_ar: "+500", color: "#8b5cf6", glow: "rgba(139,92,246,0.18)",
  },
  {
    num: 10000, suffix: "+", label_en: "Galleries delivered", label_ar: "معرض تم تسليمه",
    value_ar: "+10,000", color: "#06b6d4", glow: "rgba(6,182,212,0.15)",
  },
  {
    num: 500, suffix: " MB", label_en: "Max file size", label_ar: "أقصى حجم للملف",
    value_ar: "500 ميغا", color: "#FFD400", glow: "rgba(255,212,0,0.18)",
  },
  {
    num: 100, suffix: "%", label_en: "Arabic + English", label_ar: "عربي وإنجليزي",
    value_ar: "100%", color: "#10b981", glow: "rgba(16,185,129,0.15)",
  },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        const duration = 1600;
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(ease * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
}

export function Stats() {
  const { locale } = useLocale();
  const isAr = locale === "ar";

  return (
    <section aria-label="Platform statistics" className="relative z-10 bg-[#08080F] py-14 md:py-20 overflow-hidden">
      {/* subtle dot grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[.025]"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "36px 36px" }} />

      <div className="relative mx-auto w-[min(1180px,calc(100%-32px))] md:w-[min(1180px,calc(100%-40px))]">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-10 md:mb-14">
          <span className="h-[1px] w-8 bg-rawi-yellow" />
          <span className="font-montserrat text-[10px] font-extrabold tracking-[.25em] text-white/30 uppercase">The numbers</span>
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
              {/* number */}
              <span
                className="font-cormorant text-[56px] md:text-[72px] leading-none tracking-tight font-bold"
                style={{ color: s.color }}
              >
                {isAr ? s.value_ar : <AnimatedCounter target={s.num} suffix={s.suffix} />}
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
