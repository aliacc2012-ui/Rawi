"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const faqs = [
  {
    q_en: "Is RAWI free to start?",
    q_ar: "هل راوي مجاني للبدء؟",
    a_en:
      "Yes. The free plan gives you 5 GB of storage and 3 active galleries — no credit card required. Upgrade when you need more.",
    a_ar:
      "نعم. الخطة المجانية تمنحك 5 غيغابايت من التخزين و3 معارض نشطة — بدون بطاقة ائتمان. رقّي خطتك عندما تحتاج أكثر.",
  },
  {
    q_en: "Can my clients download the original files?",
    q_ar: "هل يمكن لعملائي تحميل الملفات الأصلية؟",
    a_en:
      "Yes. Clients can download your original uploaded files at full resolution. You can also disable downloads on a per-gallery basis for proofing-only workflows.",
    a_ar:
      "نعم. يمكن لعملائك تحميل ملفاتك الأصلية بدقة كاملة. يمكنك أيضاً تعطيل التحميل لكل معرض بشكل منفصل لسير عمل المراجعة فقط.",
  },
  {
    q_en: "Does RAWI fully support Arabic?",
    q_ar: "هل يدعم راوي اللغة العربية بالكامل؟",
    a_en:
      "Fully. RAWI is bilingual from the ground up — Arabic and English, with complete RTL layout support and UAE-first design decisions throughout.",
    a_ar:
      "بالكامل. راوي ثنائي اللغة من الأساس — عربي وإنجليزي، مع دعم كامل لتخطيط RTL وقرارات تصميمية تناسب المنطقة.",
  },
  {
    q_en: "How large can my files be?",
    q_ar: "ما الحجم الأقصى للملفات؟",
    a_en:
      "Photos and video files up to 500 MB each. Uploads are resumable — a large file will never start from zero if your connection drops mid-upload.",
    a_ar:
      "الصور وملفات الفيديو حتى 500 ميغابايت لكل ملف. عمليات الرفع قابلة للاستئناف — لن يبدأ الملف الكبير من الصفر إذا انقطع اتصالك في منتصف الرفع.",
  },
  {
    q_en: "Is my content secure?",
    q_ar: "هل محتواي آمن؟",
    a_en:
      "Yes. Your files are stored securely with access-controlled links. Galleries can be password-protected, and only people with the link can view your work.",
    a_ar:
      "نعم. ملفاتك مخزّنة بأمان مع روابط محمية بصلاحيات. يمكن تفعيل حماية بكلمة مرور للمعارض، ولا يمكن لأحد مشاهدة عملك إلا من يملك الرابط.",
  },
  {
    q_en: "Can I use my own branding?",
    q_ar: "هل يمكنني استخدام علامتي التجارية الخاصة؟",
    a_en:
      "Yes, on Creator and Pro plans. Add your studio logo, choose your accent colour, and set a custom gallery cover. RAWI stays quietly in the background.",
    a_ar:
      "نعم، في خطتَي Creator وPro. أضف شعار استوديوك، اختر لون تمييزك، وعيّن غلافاً مخصصاً للمعرض. راوي يبقى في الخلفية بهدوء.",
  },
];

export function FAQ() {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      aria-labelledby="faq-title"
      className="bg-white py-[72px] md:py-[100px]"
    >
      <div className="mx-auto w-[min(1180px,calc(100%-32px))] md:w-[min(1180px,calc(100%-40px))]">
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <span className="text-[11px] font-extrabold tracking-[.17em] text-gray-500">
            {isAr ? "الأسئلة الشائعة" : "FREQUENTLY ASKED"}
          </span>
          <h2
            id="faq-title"
            className="mt-3 text-[36px] leading-[1.02] tracking-[-.05em] md:text-[58px]"
          >
            {isAr ? (
              <>
                لديك <span className="text-[#e5b800]">سؤال؟</span>
              </>
            ) : (
              <>
                Got a <span className="text-[#e5b800]">question?</span>
              </>
            )}
          </h2>
        </div>

        {/* Accordion */}
        <div className="divide-y divide-gray-100 rounded-[28px] border border-gray-200 bg-[#fcfcfb] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,.04)]">
          {faqs.map((faq, idx) => {
            const isOpen = open === idx;
            return (
              <div key={idx}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  onClick={() => setOpen(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-start transition-colors hover:bg-[#faf8f3] md:px-8 md:py-6"
                >
                  <span className="text-sm font-extrabold leading-snug md:text-base">
                    {isAr ? faq.q_ar : faq.q_en}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gray-200 bg-white text-sm font-bold text-gray-600 transition-transform duration-200 ${
                      isOpen ? "rotate-45 bg-rawi-yellow border-rawi-yellow text-black" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div
                    id={`faq-answer-${idx}`}
                    className="px-6 pb-6 md:px-8 md:pb-7"
                  >
                    <p className="max-w-[680px] text-sm leading-relaxed text-gray-500">
                      {isAr ? faq.a_ar : faq.a_en}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support nudge */}
        <p className="mt-8 text-center text-sm text-gray-400">
          {isAr ? (
            <>
              لم تجد إجابتك؟{" "}
              <a href="/support" className="font-bold text-black hover:underline">
                تواصل مع الدعم
              </a>
            </>
          ) : (
            <>
              Still have questions?{" "}
              <a href="/support" className="font-bold text-black hover:underline">
                Talk to support →
              </a>
            </>
          )}
        </p>
      </div>
    </section>
  );
}
