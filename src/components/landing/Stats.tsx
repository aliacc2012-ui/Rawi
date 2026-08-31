"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const stats = [
  { value_en: "500+",    value_ar: "+500",     num: 500,  suffix: "+",    label_en: "Creators in the UAE",         label_ar: "مبدع في الإمارات" },
  { value_en: "10,000+", value_ar: "+10,000",  num: 10000,suffix: "+",    label_en: "Galleries delivered",          label_ar: "معرض تم تسليمه" },
  { value_en: "500 MB",  value_ar: "500 ميغا", num: 500,  suffix: " MB",  label_en: "Max file size",                label_ar: "أقصى حجم للملف" },
  { value_en: "100%",    value_ar: "100%",     num: 100,  suffix: "%",    label_en: "Bilingual — Arabic & English", label_ar: "ثنائي اللغة — عربي وإنجليزي" },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        const duration = 1400;
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

  return (
    <span ref={ref}>
      {value.toLocaleString()}{suffix}
    </span>
  );
}

export function Stats() {
  const { locale } = useLocale();
  const isAr = locale === "ar";

  return (
    <section aria-label="Platform statistics" className="relative z-10 border-y border-white/8 bg-[#0A0A18] py-10 md:py-14">
      <div className="mx-auto w-[min(1180px,calc(100%-32px))] md:w-[min(1180px,calc(100%-40px))]">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`flex flex-col ${i < stats.length - 1 ? "lg:border-e lg:border-white/8 lg:pe-8" : ""}`}
            >
              <span className="text-[36px] font-black leading-none tracking-[-0.05em] text-rawi-yellow md:text-[44px]">
                {isAr ? s.value_ar : <AnimatedCounter target={s.num} suffix={s.suffix} />}
              </span>
              <span className="mt-2 text-sm leading-snug text-white/45">
                {isAr ? s.label_ar : s.label_en}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
