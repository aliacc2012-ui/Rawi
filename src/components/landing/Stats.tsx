"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

const stats = [
  { value_en: "500+",    value_ar: "+500",    label_en: "Creators in the UAE",           label_ar: "مبدع في الإمارات" },
  { value_en: "10,000+", value_ar: "+10,000", label_en: "Galleries delivered",            label_ar: "معرض تم تسليمه" },
  { value_en: "500 MB",  value_ar: "500 ميغا",label_en: "Max file size",                  label_ar: "أقصى حجم للملف" },
  { value_en: "100%",    value_ar: "100%",    label_en: "Bilingual — Arabic & English",   label_ar: "ثنائي اللغة — عربي وإنجليزي" },
];

export function Stats() {
  const { locale } = useLocale();
  const isAr = locale === "ar";

  return (
    <section aria-label="Platform statistics" className="border-y border-white/8 bg-[#141414] py-10 md:py-14">
      <div className="mx-auto w-[min(1180px,calc(100%-32px))] md:w-[min(1180px,calc(100%-40px))]">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`flex flex-col ${i < stats.length - 1 ? "lg:border-e lg:border-white/8 lg:pe-8" : ""}`}
            >
              <span className="text-[36px] font-black leading-none tracking-[-0.05em] text-rawi-yellow md:text-[44px]">
                {isAr ? s.value_ar : s.value_en}
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
