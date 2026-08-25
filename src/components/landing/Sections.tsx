"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function Hero() {
  const { dict } = useLocale();
  return (
    <section className="min-h-[710px] grid md:grid-cols-[1.02fr_.98fr] items-center gap-12 md:gap-[72px] pt-10 pb-[70px] w-[min(1180px,calc(100%-40px))] mx-auto">
      <div>
        <div className="text-[11px] font-extrabold tracking-[0.17em] text-gray-500">{dict.hero.eyebrow}</div>
        <h1 className="text-[50px] md:text-[94px] leading-[0.94] tracking-[-0.065em] my-[18px] max-w-[720px] font-sans">
          {dict.hero.titlePre}
          <span className="bg-gradient-to-r from-rawi-yellow to-[#ffeb80] px-[0.06em]">{dict.hero.titleHighlight}</span>
          {dict.hero.titlePost}
        </h1>
        <p className="text-lg md:text-xl leading-relaxed text-gray-600 max-w-[610px]">{dict.hero.body}</p>
        <div className="flex items-center gap-6 mt-[34px] flex-col sm:flex-row items-start sm:items-center">
          <Link
            href="/signup"
            className="bg-rawi-yellow text-black font-extrabold rounded-full px-5 py-[13px] shadow-[0_8px_24px_rgba(255,212,0,0.18)] hover:-translate-y-px transition-transform"
          >
            {dict.hero.startFree}
          </Link>
          <a href="#gallery" className="font-bold">{dict.hero.viewDemo}</a>
        </div>
        <div className="mt-[30px] text-gray-400 text-[13px] flex gap-3 flex-wrap">
          {dict.hero.trust.map((t, i) => (
            <span key={t}>
              {t}
              {i < dict.hero.trust.length - 1 && <span className="mx-3">•</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-[#111] rounded-[32px] p-3 shadow-[0_34px_90px_rgba(0,0,0,0.18)] rotate-[1.2deg] max-w-[580px] mx-auto md:mx-0">
        <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden bg-[linear-gradient(180deg,transparent_30%,rgba(0,0,0,.85)),radial-gradient(circle_at_65%_55%,rgba(255,212,0,.3),transparent_27%),linear-gradient(135deg,#282828_0_42%,#0b0b0b_42%_58%,#373737_58%)]">
          <div className="absolute inset-x-6 bottom-[26px] flex justify-between items-end text-white z-10">
            <div>
              <div className="text-[10px] tracking-[0.18em] text-gray-300">CARCLCK PRESENTS</div>
              <h3 className="text-[38px] leading-none mt-2 tracking-[-0.04em]">BMW M3<br />Dubai Night</h3>
            </div>
            <button className="border-0 bg-rawi-yellow w-12 h-12 rounded-full cursor-pointer" aria-label="Play">▶</button>
          </div>
        </div>
        <div className="text-gray-400 text-[11px] flex justify-around pt-3.5 pb-2">
          <span>73 assets</span><span>182 views</span><span>17 downloads</span>
        </div>
      </div>
    </section>
  );
}

export function Strip() {
  return (
    <section className="bg-rawi-yellow overflow-hidden py-3.5">
      <div className="flex gap-8 justify-center font-black tracking-[0.08em] whitespace-nowrap">
        <span>UPLOAD</span><b>•</b><span>PRESENT</span><b>•</b><span>DELIVER</span><b>•</b><span>RAWI</span><b>•</b>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: "↥", title: "Resumable uploads", body: "Designed for massive photo sets and 4K files without restarting from zero." },
  { icon: "▶", title: "Cinematic playback", body: "Beautiful streaming previews while original master files remain available to download." },
  { icon: "✦", title: "Creator branding", body: "Your logo, accent, cover and domain. RAWI stays quietly in the background." },
  { icon: "⌁", title: "WhatsApp sharing", body: "Send a polished gallery link to clients in the channel UAE creators already use most." },
  { icon: "♡", title: "Client selections", body: "Let clients favorite photos, approve edits and make final selections in one place." },
  { icon: "ع", title: "Arabic + English", body: "Native bilingual experience with right-to-left layouts and regional-first details." },
];

export function Features() {
  return (
    <section id="features" className="py-[110px] w-[min(1180px,calc(100%-40px))] mx-auto">
      <div className="max-w-[760px] mb-12">
        <div className="text-[11px] font-extrabold tracking-[0.17em] text-gray-500">BUILT AROUND DELIVERY</div>
        <h2 className="text-[36px] md:text-[68px] leading-[1.02] tracking-[-0.055em] my-3">Everything between export and &ldquo;wow&rdquo;.</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <article key={f.title} className="bg-rawi-soft rounded-rawi p-7 min-h-[240px] border border-[#efefed]">
            <div className="w-[42px] h-[42px] rounded-[13px] bg-black text-rawi-yellow grid place-items-center text-xl mb-[42px]">{f.icon}</div>
            <h3 className="text-xl mb-2.5">{f.title}</h3>
            <p className="text-gray-500 leading-relaxed">{f.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function GalleryDemo() {
  return (
    <section id="gallery" className="bg-[#090909] text-white py-[110px]">
      <div className="w-[min(1180px,calc(100%-40px))] mx-auto">
        <div className="max-w-[760px] mb-12">
          <div className="text-[11px] font-extrabold tracking-[0.17em] text-gray-500">CLIENT EXPERIENCE</div>
          <h2 className="text-[36px] md:text-[68px] leading-[1.02] tracking-[-0.055em] my-3">Not a folder. A presentation.</h2>
        </div>
        <div className="rounded-[34px] bg-[#111] border border-[#222] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
          <div className="relative min-h-[440px] md:min-h-[580px] p-7 bg-[linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.75)),radial-gradient(circle_at_60%_50%,rgba(255,212,0,.18),transparent_26%),linear-gradient(145deg,#3b3b3b,#080808_55%,#292929)]">
            <div className="flex items-center justify-between text-gray-400 text-[11px] relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-[25px] h-[25px] rounded-[50%_50%_50%_8px] bg-rawi-yellow grid place-items-center text-black text-xs font-black">R</span>
                <span className="text-sm">RAWI</span>
              </div>
              <span>Delivered for CARCLCK</span>
            </div>
            <div className="absolute left-6 md:left-10 bottom-6 md:bottom-[38px] z-10">
              <span className="text-[10px] tracking-[0.2em] text-gray-300">BMW M3 COMPETITION</span>
              <h3 className="text-[36px] md:text-[64px] my-2 tracking-[-0.06em]">Dubai After Dark</h3>
              <p className="text-gray-400">Photography • Film • Reels</p>
            </div>
          </div>
          <div className="p-5 md:p-10">
            <div className="flex gap-5 items-baseline my-9"><span className="text-[11px] text-gray-500">01</span><h4 className="text-2xl md:text-[28px]">The Film</h4></div>
            <div className="h-[260px] md:h-[430px] rounded-[20px] bg-[linear-gradient(135deg,#222,#0b0b0b_55%,#333)] grid place-items-center">
              <button className="border-0 bg-rawi-yellow w-[68px] h-[68px] rounded-full text-xl cursor-pointer">▶</button>
            </div>
            <div className="flex gap-5 items-baseline my-9"><span className="text-[11px] text-gray-500">02</span><h4 className="text-2xl md:text-[28px]">Selected Frames</h4></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 auto-rows-[150px] md:auto-rows-[220px]">
              <div className="rounded-xl bg-[linear-gradient(150deg,#3a3a3a,#0d0d0d)]" />
              <div className="rounded-xl bg-[linear-gradient(20deg,#171717,#484848)]" />
              <div className="rounded-xl bg-[linear-gradient(135deg,#111_20%,#3f3f3f)] md:row-span-2" />
              <div className="rounded-xl bg-[linear-gradient(210deg,#333,#0e0e0e)]" />
              <div className="rounded-xl bg-[linear-gradient(70deg,#181818,#454545)]" />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-10 pb-2.5 border-t border-[#262626] mt-9 gap-4">
              <div className="flex flex-col gap-1.5">
                <strong>73 assets</strong>
                <span className="text-gray-500 text-xs">Available until Sep 30</span>
              </div>
              <button className="bg-rawi-yellow text-black font-extrabold rounded-full px-5 py-[13px]">Download collection ↓</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const PLANS = [
  { plan: "FREE", price: "0", suffix: "AED", desc: "For trying RAWI with real work.", features: ["5 GB storage", "3 active galleries", "7-day delivery", "RAWI branding"], featured: false },
  { plan: "CREATOR", price: "49", suffix: "AED/mo", desc: "For photographers and filmmakers.", features: ["100 GB storage", "Unlimited galleries", "Custom branding", "Password protection", "Download analytics"], featured: true },
  { plan: "PRO", price: "129", suffix: "AED/mo", desc: "For serious creators and teams.", features: ["500 GB storage", "4K playback", "Custom domain", "Watermarks", "Client approvals"], featured: false },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-[110px] w-[min(1180px,calc(100%-40px))] mx-auto">
      <div className="max-w-[760px] mb-12">
        <div className="text-[11px] font-extrabold tracking-[0.17em] text-gray-500">SIMPLE PRICING</div>
        <h2 className="text-[36px] md:text-[68px] leading-[1.02] tracking-[-0.055em] my-3">Start free. Grow when your archive does.</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {PLANS.map((p) => (
          <article
            key={p.plan}
            className={`rounded-[24px] p-7 flex flex-col justify-between min-h-[450px] relative border ${
              p.featured ? "border-2 border-black shadow-[0_20px_60px_rgba(0,0,0,0.08)]" : "border-gray-200"
            }`}
          >
            {p.featured && (
              <div className="absolute top-3 right-3 text-[9px] bg-rawi-yellow px-2.5 py-1.5 rounded-full font-black tracking-[0.08em]">
                MOST POPULAR
              </div>
            )}
            <div>
              <span className="text-[11px] font-black tracking-[0.12em] text-gray-500">{p.plan}</span>
              <h3 className="text-[46px] md:text-[54px] my-4 tracking-[-0.06em]">
                {p.price} <small className="text-[13px] text-gray-500 tracking-normal">{p.suffix}</small>
              </h3>
              <p className="text-gray-500">{p.desc}</p>
              <ul className="p-0 my-6 list-none">
                {p.features.map((f) => (
                  <li key={f} className="py-2.5 border-b border-gray-100 text-sm">{f}</li>
                ))}
              </ul>
            </div>
            <Link
              href="/signup"
              className={`text-center rounded-full px-5 py-[13px] font-extrabold ${
                p.featured ? "bg-rawi-yellow text-black" : "bg-white border border-gray-300 text-black"
              }`}
            >
              Choose {p.plan.charAt(0) + p.plan.slice(1).toLowerCase()}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ClosingCTA() {
  return (
    <section className="bg-rawi-yellow py-[70px]">
      <div className="w-[min(1180px,calc(100%-40px))] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-7">
        <div>
          <div className="text-[11px] font-extrabold tracking-[0.17em] text-[#504500]">RAWI • راوي</div>
          <h2 className="text-[32px] md:text-[48px] leading-none my-2.5 tracking-[-0.05em]">Make delivery part of the creative work.</h2>
        </div>
        <Link href="/signup" className="bg-white text-black font-extrabold rounded-full px-5 py-[13px] whitespace-nowrap">
          Build your first gallery
        </Link>
      </div>
    </section>
  );
}
