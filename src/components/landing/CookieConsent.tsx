"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function CookieConsent() {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem("rawi_cookie_consent");
      if (!accepted) setVisible(true);
    } catch {
      // storage blocked — don't show
    }
  }, []);

  function accept() {
    try { localStorage.setItem("rawi_cookie_consent", "1"); } catch {}
    setVisible(false);
  }
  function decline() {
    try { localStorage.setItem("rawi_cookie_consent", "0"); } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label={isAr ? "إشعار ملفات تعريف الارتباط" : "Cookie notice"}
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-[680px] rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-[0_16px_48px_rgba(0,0,0,.12)] md:bottom-6 md:left-auto md:right-6 md:max-w-[480px]"
    >
      <p className="text-sm leading-relaxed text-gray-600">
        {isAr ? (
          <>
            نستخدم ملفات تعريف الارتباط لتحسين تجربتك.{" "}
            <Link href="/privacy" className="font-bold text-black hover:underline">
              سياسة الخصوصية
            </Link>
          </>
        ) : (
          <>
            We use cookies to improve your experience.{" "}
            <Link href="/privacy" className="font-bold text-black hover:underline">
              Privacy policy
            </Link>
          </>
        )}
      </p>
      <div className={`mt-3 flex gap-2 ${isAr ? "flex-row-reverse" : ""}`}>
        <button
          onClick={accept}
          className="rounded-full bg-black px-4 py-2 text-xs font-extrabold text-white transition hover:bg-gray-800"
        >
          {isAr ? "قبول" : "Accept"}
        </button>
        <button
          onClick={decline}
          className="rounded-full border border-gray-200 px-4 py-2 text-xs font-extrabold text-gray-600 transition hover:bg-gray-50"
        >
          {isAr ? "رفض" : "Decline"}
        </button>
      </div>
    </div>
  );
}
