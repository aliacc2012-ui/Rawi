"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { PLAN_CONFIG, PLAN_ORDER } from "@/lib/plans";
import { trackEvent } from "@/lib/analytics";
import { Reveal } from "@/components/landing/Reveal";

const HERO_IMAGE =
  "https://hips.hearstapps.com/hmg-prod/images/2024-mclaren-750s-121-66cdd39e16442.jpg?crop=1xw%3A1xh%3Bcenter%2Ctop";

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
    name: "Tokyo Streets",
    cover: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
    meta: "187 photos",
    color: "#e05c5c",
    photos: [
      "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=400&q=75",
      "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=400&q=75",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=75",
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&q=75",
      "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400&q=75",
    ],
  },
  {
    name: "Sunrise Atlas",
    cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    meta: "132 photos",
    color: "#f0a050",
    photos: [
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=75",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=75",
      "https://images.unsplash.com/photo-1433838552652-f9a46b332c40?w=400&q=75",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=75",
      "https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=400&q=75",
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
    name: "Aerial Dubai",
    cover: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",
    meta: "118 photos",
    color: "#4a9eff",
    photos: [
      "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400&q=75",
      "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=400&q=75",
      "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=400&q=75",
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400&q=75",
      "https://images.unsplash.com/photo-1560369483-efb5e1ded090?w=400&q=75",
    ],
  },
];

export function Hero() {
  const { dict } = useLocale();
  const [charState, setCharState] = useState<"idle" | "excited" | "thumbsup">("idle");
  const [thumbs, setThumbs] = useState<{x:number;y:number;id:number}[]>([]);
  const thumbIdRef = useRef(0);

  const handleBtnEnter = () => setCharState("excited");
  const handleBtnLeave = () => setCharState("idle");
  const handleBtnClick = (e: React.MouseEvent) => {
    const id = ++thumbIdRef.current;
    setThumbs(prev => [...prev, { x: e.clientX, y: e.clientY, id }]);
    setCharState("thumbsup");
    setTimeout(() => setThumbs(prev => prev.filter(t => t.id !== id)), 1900);
    setTimeout(() => setCharState("idle"), 2200);
    trackEvent("signup_started", { source: "hero" });
  };

  return (
    <>
    {thumbs.map(t => (
      <span key={t.id} className="thumbsup-pop" style={{left: t.x - 20, top: t.y - 50}} aria-hidden="true">👍</span>
    ))}
    <section className="mx-auto grid min-h-0 w-[min(1240px,calc(100%-32px))] items-center gap-10 overflow-hidden pb-14 pt-8 md:min-h-[760px] md:w-[min(1240px,calc(100%-40px))] md:grid-cols-[.92fr_1.08fr] md:gap-[58px] md:pb-[80px] md:pt-10">
      <div className="relative">
        {/* Hero headline glow */}
        <div className="pointer-events-none absolute -top-32 -left-20 h-[420px] w-[520px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,212,0,0.09),transparent_65%)] blur-3xl" aria-hidden="true" />
        {/* Floating star particles */}
        <span aria-hidden="true" className="hero-star" style={{left:"12%", bottom:"38%", animationDelay:"0s"}} />
        <span aria-hidden="true" className="hero-star hero-star-sm" style={{left:"28%", bottom:"55%", animationDelay:"1.2s"}} />
        <span aria-hidden="true" className="hero-star" style={{left:"5%", bottom:"22%", animationDelay:"2.4s"}} />
        <span aria-hidden="true" className="hero-star hero-star-sm" style={{left:"42%", bottom:"65%", animationDelay:"0.8s"}} />
        <span aria-hidden="true" className="hero-star" style={{left:"62%", bottom:"30%", animationDelay:"1.8s"}} />
        <span aria-hidden="true" className="hero-star hero-star-sm" style={{left:"55%", bottom:"48%", animationDelay:"3.1s"}} />
        <div className="editorial-eyebrow hero-e1">
          <span className="h-2.5 w-2.5 rounded-full bg-rawi-yellow" />
          {dict.hero.eyebrow}
        </div>
        <h1 className="display-hero hero-e2 my-6">
          <span className="hero-word hero-w1">{dict.hero.titlePre}</span>
          <span className="hero-word hero-w2 better-shimmer-clip">
            {dict.hero.titleHighlight}
          </span>
          <span className="hero-word hero-w3">{dict.hero.titlePost}</span>
        </h1>
        <p className="hero-e3 max-w-[590px] text-base leading-relaxed text-white/50 md:text-xl">
          {dict.hero.body}
        </p>
        <div className="hero-e4 mt-8 flex flex-wrap items-center gap-5 md:gap-7">
          <Link
            href="/signup"
            onMouseEnter={handleBtnEnter}
            onMouseLeave={handleBtnLeave}
            onClick={handleBtnClick}
            className="btn-shimmer btn-glow rounded-xl px-6 py-4 text-sm font-extrabold text-black shadow-[0_12px_30px_rgba(255,200,0,.22)] md:px-7 md:text-base"
          >
            {dict.hero.startFree}
          </Link>
          <a
            href="/demo/today-drive"
            className="border-b border-white/50 pb-1 text-sm font-bold text-white/80 md:text-base"
          >
            {dict.hero.viewDemo} <span>↘</span>
          </a>
        </div>
        <div className="hero-e5 mt-7 flex flex-wrap gap-x-5 gap-y-2">
          {dict.hero.trust.map((item) => (
            <span key={item} className="font-montserrat text-[11px] font-medium tracking-wide text-white/35">✓ {item}</span>
          ))}
        </div>
      </div>
      <ProductMockup charState={charState} />
    </section>
    </>
  );
}

function ProductMockup({ charState: _charState }: { charState: "idle" | "excited" | "thumbsup" }) {
  const [openIdx, setOpenIdx] = useState(-1);
  const cycleRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    let idx = 0;
    function cycle() {
      setOpenIdx(idx);
      cycleRef.current = setTimeout(() => {
        setOpenIdx(-1);
        cycleRef.current = setTimeout(() => {
          idx = (idx + 1) % DEMO_PROJECTS.length;
          cycle();
        }, 650);
      }, 2500);
    }
    cycleRef.current = setTimeout(cycle, 800);
    return () => { if (cycleRef.current) clearTimeout(cycleRef.current); };
  }, []);

  const openProject = openIdx >= 0 ? DEMO_PROJECTS[openIdx] : null;

  return (
    <div className="relative min-h-[560px] sm:min-h-[640px] md:min-h-[700px]">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -inset-10 bg-[radial-gradient(circle_at_55%_42%,rgba(255,212,0,.13),transparent_38%)] blur-2xl" />

      {/* Album grid — no browser frame */}
      <div className="absolute left-0 top-4 z-20 w-[96%]">

        {/* Grid of album cards */}
        <div className="relative grid grid-cols-3 gap-3">
          {DEMO_PROJECTS.map((p, i) => (
            <motion.div
              key={p.name}
              className="relative overflow-hidden rounded-2xl cursor-default"
              animate={{
                opacity: openIdx >= 0 && openIdx !== i ? 0.25 : 1,
                scale: openIdx === i ? 1.02 : 1,
                filter: openIdx >= 0 && openIdx !== i ? "blur(1px)" : "blur(0px)",
              }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
            >
              {/* Cover photo */}
              <div
                className="w-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('${p.cover}')`,
                  aspectRatio: "4/3",
                }}
              />
              {/* Bottom strip */}
              <div className="bg-[#111] px-3 py-2.5 border-t border-white/[.06]">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="text-[9px] font-bold text-white truncate">{p.name}</span>
                </div>
                <div className="text-[7px] text-white/35 mt-0.5 pl-4">{p.meta}</div>
              </div>
            </motion.div>
          ))}

          {/* Open album overlay */}
          <AnimatePresence>
            {openProject && (
              <motion.div
                key={openIdx}
                className="absolute inset-0 z-30 overflow-hidden rounded-2xl bg-[#0A0A0A]"
                style={{ boxShadow: `0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px ${openProject.color}33` }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Album header */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ background: `linear-gradient(135deg, ${openProject.color}22, transparent)`, borderBottom: `1px solid ${openProject.color}22` }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: openProject.color }} />
                    <div>
                      <div className="text-[11px] font-extrabold text-white tracking-wide">{openProject.name}</div>
                      <div className="text-[8px] text-white/35">{openProject.meta}</div>
                    </div>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-[8px] font-bold text-black"
                    style={{ backgroundColor: openProject.color }}
                  >
                    ↥ Download all
                  </span>
                </div>

                {/* Photo masonry grid */}
                <div className="grid grid-cols-3 gap-[3px] p-[3px]">
                  {/* Large cover photo */}
                  <div
                    className="relative overflow-hidden rounded-lg bg-cover bg-center"
                    style={{
                      backgroundImage: `url('${openProject.cover}')`,
                      gridColumn: "span 2",
                      aspectRatio: "2/1.15",
                    }}
                  />
                  {/* Side photos */}
                  <div className="grid grid-rows-2 gap-[3px]">
                    {openProject.photos.slice(0, 2).map((ph, j) => (
                      <div
                        key={j}
                        className="overflow-hidden rounded-lg bg-cover bg-center"
                        style={{ backgroundImage: `url('${ph}')`, aspectRatio: "1/0.57" }}
                      />
                    ))}
                  </div>
                  {/* Bottom row */}
                  {openProject.photos.slice(2, 5).map((ph, j) => (
                    <div
                      key={j}
                      className="overflow-hidden rounded-lg bg-cover bg-center"
                      style={{ backgroundImage: `url('${ph}')`, aspectRatio: "1/0.75" }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating: Gallery link sent */}
      <div
        className="absolute -left-4 bottom-24 z-30 flex items-center gap-2.5 rounded-2xl border border-white/[.08] bg-[#111]/90 px-3.5 py-3 shadow-[0_12px_40px_rgba(0,0,0,.4)] backdrop-blur-sm"
        style={{ animation: "hero-e3 .6s cubic-bezier(.22,1,.36,1) .9s both" }}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#25D366] text-white text-sm">✓</span>
        <div>
          <div className="text-[10px] font-bold text-white">Gallery link sent</div>
          <div className="text-[8px] text-white/40 mt-0.5">via WhatsApp · just now</div>
        </div>
      </div>

      {/* Floating: client reaction */}
      <div
        className="absolute -right-2 top-[36%] z-30 rounded-2xl border border-white/[.08] bg-[#111]/90 px-3.5 py-3 shadow-[0_12px_40px_rgba(0,0,0,.4)] backdrop-blur-sm"
        style={{ animation: "hero-e4 .6s cubic-bezier(.22,1,.36,1) 1.1s both" }}
      >
        <div className="text-[8px] text-white/35 tracking-[.1em]">CLIENT</div>
        <div className="text-[11px] font-bold text-white mt-1">
          {openProject ? openProject.name : "Sarah"} ♡ 3 photos
        </div>
        <div className="mt-2 flex gap-1">
          {DEMO_PROJECTS.slice(0, 3).map((p, j) => (
            <div key={j} className="h-8 w-8 rounded-lg bg-cover bg-center border border-white/10"
                 style={{ backgroundImage: `url('${p.cover}')` }} />
          ))}
        </div>
      </div>

      {/* Floating: downloads */}
      <div
        className="absolute bottom-8 right-4 z-30 flex items-center gap-2 rounded-2xl border border-white/[.08] bg-[#111]/90 px-3 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,.4)] backdrop-blur-sm"
        style={{ animation: "hero-e5 .5s cubic-bezier(.22,1,.36,1) 1.3s both" }}
      >
        <span className="h-6 w-6 grid place-items-center rounded-lg bg-rawi-yellow/20 text-rawi-yellow text-xs">↥</span>
        <div>
          <div className="text-[9px] font-bold text-white">12 files downloaded</div>
          <div className="text-[7px] text-white/35">Client delivered ✓</div>
        </div>
      </div>
    </div>
  );
}


export function Strip() {
  return (
    <section className="bg-rawi-yellow overflow-hidden py-3 md:py-3.5">
      <div className="flex gap-5 md:gap-8 justify-center text-[11px] md:text-base font-black tracking-[0.08em] whitespace-nowrap">
        <span>UPLOAD</span>
        <b>•</b>
        <span>PRESENT</span>
        <b>•</b>
        <span>DELIVER</span>
        <b>•</b>
        <span>RAWI</span>
        <b>•</b>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: "↥",
    title: "Resumable uploads",
    body: "Resumable delivery for supported photo and video files, with progress that can continue after interruption.",
  },
  {
    icon: "▶",
    title: "Gallery previews",
    body: "Polished client previews while original uploaded files remain available to download.",
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
export function Features() {
  return (
    <section
      id="features"
      className="py-[110px] w-[min(1180px,calc(100%-40px))] mx-auto"
    >
      <div className="max-w-[760px] mb-8 md:mb-12">
        <div className="text-[11px] font-extrabold tracking-[0.17em] text-gray-500">
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
            className="bg-rawi-soft rounded-rawi p-7 min-h-[240px] border border-[#efefed]"
          >
            <div className="w-[42px] h-[42px] rounded-[13px] bg-black text-rawi-yellow grid place-items-center text-xl mb-[42px]">
              {f.icon}
            </div>
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
    <section id="gallery" className="bg-[#06060F] py-[72px] md:py-[110px]">
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
        <div className="rounded-[24px] md:rounded-[34px] bg-[#111] text-white border border-black/10 overflow-hidden shadow-[0_35px_90px_rgba(15,15,15,0.18)]">
          <div className="h-10 border-b border-white/10 flex items-center gap-2 px-4">
            <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
            <span className="w-2.5 h-2.5 rounded-full bg-rawi-yellow" />
            <div className="ml-3 text-[8px] text-white/35">
              rawi.gallery/today-drive
            </div>
          </div>
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
                  style={{ backgroundImage: `url('${p.image}')` }}
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
                <div className="font-bold">8 unique automotive stories</div>
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
      className="py-[72px] md:py-[110px] w-[min(1180px,calc(100%-32px))] md:w-[min(1180px,calc(100%-40px))] mx-auto"
    >
      <div className="max-w-[760px] mb-12">
        <div className="text-[11px] font-extrabold tracking-[0.17em] text-gray-500">
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
    <section className="relative overflow-hidden bg-[#06060F] py-[100px] md:py-[160px]">
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

