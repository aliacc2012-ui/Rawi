"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { PLAN_CONFIG, PLAN_ORDER } from "@/lib/plans";
import { trackEvent } from "@/lib/analytics";
import { Reveal } from "@/components/landing/Reveal";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1614026480209-cd9934144671?w=800&q=80";

const DEMO_PROJECTS = [
  {
    name: "Venice Wedding",
    cover: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80",
    meta: "214 photos",
    color: "#c9a96e",
    photos: [
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&q=75",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&q=75",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&q=75",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&q=75",
      "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400&q=75",
    ],
  },


  {
    name: "Studio Sessions",
    cover: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
    meta: "96 photos",
    color: "#8b7cf6",
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=75",
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&q=75",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=75",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=75",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=75",
    ],
  },
  {
    name: "Café Lumière",
    cover: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
    meta: "74 photos",
    color: "#5cb8a0",
    photos: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=75",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=75",
      "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=75",
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&q=75",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=75",
    ],
  },
  {
    name: "Desert Drift",
    cover: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&q=80",
    meta: "156 photos",
    color: "#e8a020",
    photos: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=75",
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=75",
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=400&q=75",
      "https://images.unsplash.com/photo-1542362567-b07e54358753?w=400&q=75",
      "https://images.unsplash.com/photo-1493238792000-8113da705763?w=400&q=75",
    ],
  },
  {
    name: "BMW M Series",
    cover: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80",
    meta: "143 photos",
    color: "#0066cc",
    photos: [
      "https://images.unsplash.com/photo-1556800572-1b8aeef2c54f?w=400&q=75",
      "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400&q=75",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&q=75",
      "https://images.unsplash.com/photo-1617531653332-bd46c16f4d68?w=400&q=75",
      "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=400&q=75",
    ],
  },
  {
    name: "Porsche 911",
    cover: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80",
    meta: "98 photos",
    color: "#cc2200",
    photos: [
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&q=75",
      "https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=400&q=75",
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&q=75",
      "https://images.unsplash.com/photo-1493238792000-8113da705763?w=400&q=75",
      "https://images.unsplash.com/photo-1542362567-b07e54358753?w=400&q=75",
    ],
  },
];

const MORPH_WORDS = ["Wedding", "Automotive", "Portrait", "Lifestyle", "Commercial"];

const COL1_IMGS = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80",
  "https://images.unsplash.com/photo-1556800572-1b8aeef2c54f?w=500&q=80",
  "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=500&q=80",
  "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500&q=80",
  "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=500&q=80",
  "https://images.unsplash.com/photo-1617531653332-bd46c16f4d68?w=500&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&q=80",
  "https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=500&q=80",
];

const COL2_IMGS = [
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&q=80",
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&q=80",
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80",
  "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=500&q=80",
  "https://images.unsplash.com/photo-1493238792000-8113da705763?w=500&q=80",
];

export function Hero() {
  const { dict } = useLocale();
  const [wordIdx, setWordIdx] = useState(0);
  const [thumbs, setThumbs] = useState<{x:number;y:number;id:number}[]>([]);
  const thumbIdRef = useRef(0);

  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % MORPH_WORDS.length), 2800);
    return () => clearInterval(t);
  }, []);

  const handleBtnClick = (e: React.MouseEvent) => {
    const id = ++thumbIdRef.current;
    setThumbs(prev => [...prev, { x: e.clientX, y: e.clientY, id }]);
    setTimeout(() => setThumbs(prev => prev.filter(t => t.id !== id)), 1900);
    trackEvent("signup_started", { source: "hero" });
  };

  // Mouse tilt for film strip
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);

  return (
    <>
      {thumbs.map(t => (
        <span key={t.id} className="thumbsup-pop" style={{left: t.x - 20, top: t.y - 50}} aria-hidden="true">👍</span>
      ))}

      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* ── Ambient atmosphere ── */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-rawi-yellow/[.06] blur-[140px]" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-violet-600/[.05] blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-cyan-500/[.04] blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto w-[min(1280px,calc(100%-32px))] grid md:grid-cols-[1.05fr_.95fr] gap-10 md:gap-16 items-center py-24 md:py-0 md:min-h-[calc(100vh-64px)]">

          {/* ── Left: Editorial copy ── */}
          <div className="relative">
            {/* Eyebrow */}
            <motion.div
              className="flex items-center gap-2.5 mb-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="h-[1px] w-8 bg-rawi-yellow" />
              <span className="font-montserrat text-[10px] font-extrabold tracking-[.25em] text-white/40 uppercase">
                {dict.hero.eyebrow}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="font-cormorant leading-[1.0] tracking-[-0.025em]"
              style={{ fontSize: "clamp(60px, 8.5vw, 108px)" }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <span className="block text-white/90">For every</span>
              <span className="block relative overflow-hidden" style={{ height: "1.08em" }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIdx}
                    className="block italic text-rawi-yellow drop-shadow-[0_0_40px_rgba(255,212,0,0.35)]"
                    initial={{ y: "110%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-110%", opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {MORPH_WORDS[wordIdx]}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="block text-white/90">creator.</span>
            </motion.h1>

            {/* Body */}
            <motion.p
              className="mt-6 max-w-[500px] text-base md:text-lg leading-relaxed text-white/45 font-montserrat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              {dict.hero.body}
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="mt-9 flex flex-wrap items-center gap-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Link
                href="/signup"
                onClick={handleBtnClick}
                className="btn-shimmer btn-glow rounded-xl px-7 py-4 text-sm font-extrabold text-black shadow-[0_12px_30px_rgba(255,200,0,.22)] hover:brightness-110 transition"
              >
                {dict.hero.startFree}
              </Link>
              <a
                href="/demo/today-drive"
                className="border-b border-white/40 pb-1 text-sm font-bold text-white/70 hover:text-white transition"
              >
                {dict.hero.viewDemo} <span>↘</span>
              </a>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              className="mt-7 flex flex-wrap gap-x-5 gap-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.65 }}
            >
              {dict.hero.trust.map((item) => (
                <span key={item} className="font-montserrat text-[11px] font-medium tracking-wide text-white/30">✓ {item}</span>
              ))}
            </motion.div>

            {/* Masthead rule */}
            <motion.div
              className="mt-10 pt-6 border-t border-white/[.07] flex items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <span className="font-montserrat text-[10px] tracking-[.22em] text-white/20 uppercase">
                UAE-Born · Photography OS · Est 2024
              </span>
              <span className="flex-1 h-[1px] bg-white/[.06]" />
            </motion.div>
          </div>

          {/* ── Right: Film strip with 3D tilt ── */}
          <motion.div
            className="relative h-[480px] md:h-[min(780px,90vh)] overflow-hidden rounded-[28px] select-none"
            style={{ rotateX, rotateY, perspective: 900, transformStyle: "preserve-3d" }}
            onMouseMove={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              mouseX.set(e.clientX - rect.left - rect.width / 2);
              mouseY.set(e.clientY - rect.top - rect.height / 2);
            }}
            onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3 }}
          >
            {/* Top + bottom gradient fades */}
            <div className="pointer-events-none absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-rawi-ink to-transparent z-10" />
            <div className="pointer-events-none absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-rawi-ink to-transparent z-10" />
            {/* Ambient inner glow */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,212,0,.06),transparent_65%)] z-[5]" />

            <div className="flex gap-3 h-full">
              {/* Column 1 — scrolls UP */}
              <div className="flex-1 overflow-hidden">
                <div className="marquee-up flex flex-col gap-3">
                  {[...COL1_IMGS, ...COL1_IMGS].map((src, i) => (
                    <div key={i} className="relative overflow-hidden rounded-2xl shrink-0" style={{ height: "200px" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" onError={(e) => { const el = e.currentTarget; el.style.display="none"; el.parentElement!.style.background="#1a1a2e"; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Column 2 — scrolls DOWN */}
              <div className="flex-1 overflow-hidden">
                <div className="marquee-down flex flex-col gap-3">
                  {[...COL2_IMGS, ...COL2_IMGS].map((src, i) => (
                    <div key={i} className="relative overflow-hidden rounded-2xl shrink-0" style={{ height: "200px" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" onError={(e) => { const el = e.currentTarget; el.style.display="none"; el.parentElement!.style.background="#1a1a2e"; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

const FEATURES = [
  {
    icon: "⌖",
    title: "Client galleries",
    body: "Password-protected, branded galleries your clients can open on any device.",
  },
  {
    icon: "↓",
    title: "One-click downloads",
    body: "Full-resolution downloads — individual photos or the entire gallery in a zip.",
  },
  {
    icon: "✦",
    title: "Creator branding",
    body: "Your logo, accent and cover. RAWI stays quietly in the background.",
  },
  {
    icon: "⌁",
    title: "WhatsApp sharing",
    body: "Send a polished gallery link to clients in the channel UAE creators already use most.",
  },
  {
    icon: "♡",
    title: "Client selections",
    body: "Let clients favorite photos and make final selections in one place.",
  },
  {
    icon: "ع",
    title: "Arabic + English",
    body: "Native bilingual experience with right-to-left layouts and regional-first details.",
  },
];

export function Strip() {
  const items = ["Wedding", "Automotive", "Portrait", "Lifestyle", "Commercial", "Corporate", "Fashion", "Editorial"];
  const row = [...items, ...items, ...items];
  return (
    <div className="overflow-hidden border-y border-white/[.07] py-3 bg-rawi-graphite/50">
      <div className="flex gap-8 whitespace-nowrap" style={{animation:"strip-scroll 22s linear infinite"}}>
        {row.map((item, i) => (
          <span key={i} className="font-montserrat text-[11px] tracking-[.2em] uppercase text-white/25 flex items-center gap-3 shrink-0">
            <span className="text-rawi-yellow">✦</span> {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Features() {
  return (
    <section
      id="features"
      className="py-[72px] w-[min(1180px,calc(100%-40px))] mx-auto"
    >
      <div className="max-w-[760px] mb-8 md:mb-12">
        <div className="text-[11px] font-extrabold tracking-[0.17em] text-white/35">
          BUILT AROUND DELIVERY
        </div>
        <h2 className="text-[36px] md:text-[68px] leading-[1.02] tracking-[-0.055em] my-3">
          Everything between export and &ldquo;wow&rdquo;.
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <article
            key={f.title}
            className="bg-rawi-panel border border-white/[.07] rounded-[20px] p-7 min-h-[240px] hover:-translate-y-1 transition-transform"
          >
            <div className="w-[42px] h-[42px] rounded-[13px] bg-black text-rawi-yellow grid place-items-center text-xl mb-[42px]">
              {f.icon}
            </div>
            <h3 className="text-xl mb-2.5">{f.title}</h3>
            <p className="text-white/45 leading-relaxed">{f.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function GalleryDemo() {
  return (
    <section id="gallery" className="bg-[#06060F] py-[52px] md:py-[80px]">
      <div className="w-[min(1180px,calc(100%-32px))] md:w-[min(1180px,calc(100%-40px))] mx-auto">
        <div className="grid lg:grid-cols-[.78fr_1.22fr] gap-5 lg:gap-14 items-end mb-8 md:mb-12">
          <div>
            <div className="editorial-eyebrow mb-4">CLIENT EXPERIENCE</div>
            <h2 className="display-section mt-4">
              Not a folder.
              <br />
              <span style={{color:"#C9962A"}}>A presentation.</span>
            </h2>
          </div>
          <p className="text-white/45 max-w-[620px] text-lg leading-relaxed lg:pb-2">
            Give clients a branded experience that feels like part of the
            shoot—not an afterthought.
          </p>
        </div>
        <div className="rounded-[24px] md:rounded-[34px] bg-[#111] text-white border border-white/[.06] overflow-hidden shadow-[0_35px_90px_rgba(0,0,0,0.5)]">
          <div
            className="relative min-h-[320px] md:min-h-[420px] p-5 md:p-7 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(180deg,rgba(0,0,0,.10),rgba(0,0,0,.82)),url('${HERO_IMAGE}')`,
            }}
          >
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-[50%_50%_50%_8px] bg-rawi-yellow text-black grid place-items-center font-black">
                  R
                </span>
                <span className="font-bold">RAWI</span>
              </div>
              <span className="text-white/45">Delivered with RAWI</span>
            </div>
            <div className="absolute left-5 bottom-5 md:left-7 md:bottom-7">
              <span className="text-[9px] tracking-[.18em] text-rawi-yellow">
                AUTOMOTIVE
              </span>
              <h3 className="text-4xl md:text-5xl tracking-[-.06em] mt-2">
                Today Drive
              </h3>
              <p className="text-white/55 text-sm mt-2">
                A curated automotive collection
              </p>
            </div>
          </div>
          <div className="p-5 md:p-7">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {DEMO_PROJECTS.map((p) => (
                <div
                  key={p.name}
                  className="relative h-40 md:h-48 rounded-xl overflow-hidden bg-cover bg-center"
                  style={{ backgroundImage: `url('${p.cover}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute left-3 bottom-3">
                    <div className="text-xs font-bold">{p.name}</div>
                    <div className="text-[9px] text-white/50 mt-1">
                      {p.meta}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-t border-white/10 mt-6 pt-5 gap-4">
              <div>
                <div className="font-bold">6 unique automotive stories</div>
                <div className="text-xs text-white/40">
                  Every gallery gets its own visual identity.
                </div>
              </div>
              <Link
                href="/demo/today-drive"
                className="w-full sm:w-auto bg-rawi-yellow text-black rounded-full px-5 py-3 text-center text-xs font-extrabold"
              >
                View live demo →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const PLAN_DESCRIPTIONS = {
  free: "For trying RAWI with real work.",
  creator: "For photographers and filmmakers.",
  pro: "For serious creators and teams.",
} as const;
export function Pricing() {
  return (
    <section
      id="pricing"
      className="py-[52px] md:py-[80px] w-[min(1180px,calc(100%-32px))] md:w-[min(1180px,calc(100%-40px))] mx-auto"
    >
      <div className="max-w-[760px] mb-12">
        <div className="text-[11px] font-extrabold tracking-[0.17em] text-white/35">
          SIMPLE PRICING
        </div>
        <h2 className="text-[36px] md:text-[68px] leading-[1.02] tracking-[-0.055em] my-3">
          Start free. Grow when your archive does.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
        {PLAN_ORDER.map((id) => {
          const p = PLAN_CONFIG[id];
          return (
            <article
              key={id}
              className={`rounded-[24px] p-6 md:p-7 flex flex-col justify-between min-h-0 md:min-h-[450px] relative border bg-[#0A0A18] ${p.featured ? "border-2 border-rawi-yellow/70 shadow-[0_0_0_1px_rgba(255,212,0,0.15),0_20px_80px_rgba(255,212,0,0.18),0_4px_20px_rgba(255,212,0,0.1)]" : "border-white/10"}`}
            >
              {p.featured && (
                <>
                <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-[22px] bg-gradient-to-r from-rawi-yellow/0 via-rawi-yellow to-rawi-yellow/0" />
                <div className="absolute top-3 right-3 text-[9px] bg-rawi-yellow px-2.5 py-1.5 rounded-full font-black tracking-[0.08em]">
                  MOST POPULAR
                </div>
                </>
              )}
              <div>
                <span className="text-[11px] font-black tracking-[0.12em] text-white/45">
                  {p.name.toUpperCase()}
                </span>
                <h3 className="text-[46px] md:text-[54px] my-4 tracking-[-0.06em]">
                  {p.priceAed}{" "}
                  <small className="text-[13px] text-white/40 tracking-normal">
                    {p.priceAed === 0 ? "AED" : "AED/mo"}
                  </small>
                </h3>
                <p className="text-white/45">{PLAN_DESCRIPTIONS[id]}</p>
                <ul className="p-0 my-6 list-none">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="py-2.5 border-b border-white/8 text-sm text-white/80"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={`/signup?plan=${id}`}
                onClick={() =>
                  trackEvent("pricing_click", {
                    plan: id,
                    price_aed: p.priceAed,
                  })
                }
                className={`text-center rounded-full px-5 py-[13px] font-extrabold ${p.featured ? "bg-rawi-yellow text-black" : "bg-white/8 border border-white/15 text-white"}`}
              >
                Choose {p.name}
              </Link>
            </article>
          );
        })}
        <article className="rounded-[24px] bg-[linear-gradient(145deg,#181818,#050505)] p-6 text-white md:p-7 flex flex-col justify-between min-h-0 md:min-h-[450px] relative border border-black">
          <div>
            <span className="text-[11px] font-black tracking-[0.12em] text-white/45">
              CUSTOM
            </span>
            <h3 className="text-[42px] leading-[.95] my-4 tracking-[-0.055em]">
              Built around your studio.
            </h3>
            <p className="text-white/50">
              For teams that need custom storage, access and delivery volume.
            </p>
            <ul className="p-0 my-6 list-none text-white/80">
              {[
                "Flexible storage",
                "Multiple team members",
                "Tailored gallery limits",
                "Priority support",
              ].map((feature) => (
                <li
                  key={feature}
                  className="py-2.5 border-b border-white/10 text-sm"
                >
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <Link
            href="/support?subject=Custom%20RAWI%20plan"
            className="text-center rounded-full bg-rawi-yellow px-5 py-[13px] font-extrabold text-black"
          >
            Talk to RAWI
          </Link>
        </article>
      </div>

      {/* Trust row */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/35">
        {[
          "✓ No credit card required",
          "✓ Cancel anytime",
          "✓ Secure checkout",
          "✓ UAE-based support",
        ].map((item) => (
          <span key={item} className="font-semibold">{item}</span>
        ))}
      </div>
    </section>
  );
}

export function ClosingCTA() {
  return (
    <section className="relative overflow-hidden bg-[#06060F] py-[64px] md:py-[100px]">
      {/* Gold glow */}
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(201,150,42,.55) 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{ backgroundImage: "radial-gradient(circle, #F2ECD8 1px, transparent 1px)", backgroundSize: "36px 36px" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto w-[min(960px,calc(100%-32px))] text-center md:w-[min(960px,calc(100%-40px))]">
        <span className="font-cormorant pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 hidden select-none text-[200px] leading-none text-white/[.022] lg:block" aria-hidden="true">∞</span>

        <Reveal>
          <div className="editorial-eyebrow mb-10 justify-center" style={{ color: "#C9962A" }}>
            Your first gallery is free
          </div>
        </Reveal>

        <Reveal delay={1}>
          <h2 className="display-section mb-8 mx-auto text-[#F2ECD8]">
            Make delivery part<br />
            of the{" "}
            <em className="not-italic better-shimmer-clip">creative work.</em>
          </h2>
        </Reveal>

        <Reveal delay={2}>
          <div className="gold-rule mx-auto mb-10" />
        </Reveal>

        <Reveal delay={3}>
          <p className="font-montserrat mx-auto mb-14 max-w-[480px] text-[17px] font-light leading-relaxed text-white/35">
            Stop sending Drive links. Give your clients a gallery that feels as considered as the shoot itself.
          </p>
        </Reveal>

        <Reveal delay={4}>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              onClick={() => trackEvent("signup_started", { source: "closing_cta" })}
              className="font-montserrat group inline-flex w-full items-center justify-center gap-3 rounded-full bg-rawi-yellow px-8 py-4 text-sm font-bold tracking-wide text-black shadow-[0_16px_48px_rgba(255,200,0,.30)] transition-all hover:scale-105 hover:shadow-[0_20px_60px_rgba(255,200,0,.42)] sm:w-auto md:text-base"
            >
              Build your first gallery
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <a
              href="/demo/today-drive"
              className="font-montserrat inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-8 py-4 text-sm font-medium text-white/50 transition-all hover:border-white/25 hover:text-white/80 sm:w-auto md:text-base"
            >
              View live demo
            </a>
          </div>
        </Reveal>

        <Reveal delay={5}>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
            {["No credit card needed", "Free forever plan", "Setup in 5 minutes"].map((t) => (
              <span key={t} className="font-montserrat text-[11px] font-medium tracking-[0.18em] text-white/25 uppercase">✓ {t}</span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

