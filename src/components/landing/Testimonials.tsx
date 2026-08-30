"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

const testimonials = [
  {
    quote_en:
      "RAWI completely changed how I deliver work to clients. They open the link and it feels like a proper studio experience, not just a folder.",
    quote_ar:
      "راوي غيّر طريقة تسليم شغلي للعملاء كلياً. يفتحون الرابط ويحسون إنه تجربة استوديو احترافية، مش مجرد فولدر.",
    name_en: "Khalid Al Mansoori",
    name_ar: "خالد المنصوري",
    role_en: "Automotive Photographer · Dubai",
    role_ar: "مصور سيارات · دبي",
    initials: "KM",
  },
  {
    quote_en:
      "My clients always ask how I built the gallery. The branded experience makes my studio look 10× more professional.",
    quote_ar:
      "عملائي دائماً يسألون كيف بنيت المعرض. التجربة ببراند الاستوديو تخلي شغلي يبدو أكثر احترافية بعشر مرات.",
    name_en: "Nour Al Rashidi",
    name_ar: "نور الراشدي",
    role_en: "Wedding Filmmaker · Abu Dhabi",
    role_ar: "مصورة أفراح · أبوظبي",
    initials: "NR",
  },
  {
    quote_en:
      "Resumable uploads are a game-changer. I used to lose progress on large RAW files constantly. Never again.",
    quote_ar:
      "رفع الملفات القابل للاستئناف شيء يغير قواعد اللعبة. كنت أخسر التقدم في ملفات RAW الكبيرة باستمرار. لن يحدث هذا مجدداً.",
    name_en: "Faisal Al Otaibi",
    name_ar: "فيصل العتيبي",
    role_en: "Commercial Photographer · Riyadh",
    role_ar: "مصور تجاري · الرياض",
    initials: "FO",
  },
  {
    quote_en:
      "The WhatsApp share button alone is worth it. Clients here don't check email — they live on WhatsApp.",
    quote_ar:
      "زر المشاركة عبر واتساب وحده يستحق. العملاء هنا ما يفحصون الإيميل — يعيشون على واتساب.",
    name_en: "Sara Al Hammadi",
    name_ar: "سارة الحمادي",
    role_en: "Event Photographer · Sharjah",
    role_ar: "مصورة مناسبات · الشارقة",
    initials: "SH",
  },
];

export function Testimonials() {
  const { locale } = useLocale();
  const isAr = locale === "ar";

  return (
    <section
      aria-labelledby="testimonials-title"
      className="bg-[#fbf6ef] py-[72px] md:py-[100px]"
    >
      <div className="mx-auto w-[min(1180px,calc(100%-32px))] md:w-[min(1180px,calc(100%-40px))]">
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <span className="text-[11px] font-extrabold tracking-[.17em] text-gray-500">
            {isAr ? "ماذا يقول المبدعون" : "WHAT CREATORS SAY"}
          </span>
          <h2
            id="testimonials-title"
            className="mt-3 text-[36px] leading-[1.02] tracking-[-.05em] md:text-[58px]"
          >
            {isAr ? (
              <>
                موثوق من قِبل{" "}
                <span className="text-[#e5b800]">المصورين.</span>
              </>
            ) : (
              <>
                Trusted by{" "}
                <span className="text-[#e5b800]">creators.</span>
              </>
            )}
          </h2>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <article
              key={t.initials}
              className="group flex flex-col rounded-[22px] border border-gray-200 bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,.045)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,.08)]"
            >
              {/* Stars */}
              <div className="flex gap-0.5 text-rawi-yellow text-sm" aria-label="5 stars">
                {"★★★★★".split("").map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-gray-600">
                &ldquo;{isAr ? t.quote_ar : t.quote_en}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-rawi-yellow text-[11px] font-black text-black">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-extrabold leading-tight">
                    {isAr ? t.name_ar : t.name_en}
                  </div>
                  <div className="mt-0.5 text-[10px] text-gray-400">
                    {isAr ? t.role_ar : t.role_en}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
