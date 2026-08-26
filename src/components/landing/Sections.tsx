"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const HERO_IMAGE = "https://hips.hearstapps.com/hmg-prod/images/2024-mclaren-750s-121-66cdd39e16442.jpg?crop=1xw%3A1xh%3Bcenter%2Ctop";

const DEMO_PROJECTS = [
  {
    name: "M3 F80 Silver",
    image: "https://cdn.myportfolio.com/73cfc9a0-30aa-4f01-b629-e720c0fd6095/8f46a7d7-574d-49f7-bf22-7724d30b43c7_rw_3840.jpg?h=aff02d94bbfa6aa57cbc0cc93684aaf6",
    meta: "132 photos",
  },
  {
    name: "M3 G80 Orange",
    image: "https://cdn.bmwblog.com/wp-content/uploads/2021/04/MG_4274-Edit-scaled.jpg",
    meta: "118 photos",
  },
  {
    name: "M2 CS Green",
    image: "https://images.collectingcars.com/014485/DSC08641.jpg?auto=format%2Ccompress&cs=srgb&fit=fillmax&q=85",
    meta: "95 photos",
  },
  {
    name: "Porsche GT3 RS Yellow",
    image: "https://uhdwalls.com/2025/porsche-911-gt3-rs-yellow-beast/porsche-911-gt3-rs-yellow-beast-2048x2048.jpg",
    meta: "146 photos",
  },
  {
    name: "M3 F80 Red",
    image: "https://img.goodfon.com/original/2048x1280/2/50/bmw-m3-f80-red-road-autumn-forest.jpg",
    meta: "84 photos",
  },
  {
    name: "Porsche GT4",
    image: "https://www.supercars.net/blog/wp-content/uploads/2020/07/2020-Porsche-718-Cayman-GT4-001-1600.jpg",
    meta: "74 photos",
  },
  {
    name: "Lamborghini Huracán STO",
    image: "https://hips.hearstapps.com/hmg-prod/images/2021-lamborghini-huracan-sto-114-1640358044.jpg?crop=1xw%3A1xh%3Bcenter%2Ctop&resize=980%3A%2A",
    meta: "109 photos",
  },
  {
    name: "Ferrari 296 GTB",
    image: "https://www.soldoutservice.com/wp-content/uploads/2022/09/ferrari-296-gbt-1.jpg",
    meta: "91 photos",
  },
];

export function Hero() {
  const { dict } = useLocale();
  return (
    <section className="min-h-[760px] grid md:grid-cols-[.92fr_1.08fr] items-center gap-12 md:gap-[58px] pt-10 pb-[80px] w-[min(1240px,calc(100%-40px))] mx-auto overflow-hidden">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-[10px] font-extrabold tracking-[.14em] text-gray-500 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-rawi-yellow" /> {dict.hero.eyebrow}
        </div>
        <h1 className="text-[50px] md:text-[88px] leading-[0.94] tracking-[-0.065em] my-[20px] max-w-[720px] font-sans">
          {dict.hero.titlePre}
          <span className="bg-gradient-to-r from-rawi-yellow to-[#ffeb80] px-[0.06em]">{dict.hero.titleHighlight}</span>
          {dict.hero.titlePost}
        </h1>
        <p className="text-lg md:text-xl leading-relaxed text-gray-600 max-w-[610px]">{dict.hero.body}</p>
        <div className="flex items-center gap-6 mt-[34px] flex-col sm:flex-row items-start sm:items-center">
          <Link href="/signup" className="bg-rawi-yellow text-black font-extrabold rounded-full px-6 py-[14px] shadow-[0_12px_32px_rgba(255,212,0,0.22)] hover:-translate-y-px transition-transform">
            {dict.hero.startFree}
          </Link>
          <a href="#gallery" className="font-bold flex items-center gap-2">{dict.hero.viewDemo} <span>↘</span></a>
        </div>
        <div className="mt-[30px] text-gray-400 text-[13px] flex gap-3 flex-wrap">
          {dict.hero.trust.map((t, i) => <span key={t}>{t}{i < dict.hero.trust.length - 1 && <span className="mx-3">•</span>}</span>)}
        </div>
      </div>
      <ProductMockup />
    </section>
  );
}

function ProductMockup() {
  return (
    <div className="relative min-h-[640px] md:min-h-[700px]">
      <div className="absolute -inset-10 bg-[radial-gradient(circle_at_55%_45%,rgba(255,212,0,.20),transparent_34%)] blur-2xl pointer-events-none" />

      <div className="absolute left-0 top-10 w-[92%] rounded-[28px] border border-black/10 bg-[#111] p-2.5 shadow-[0_40px_100px_rgba(0,0,0,.24)] -rotate-[1.1deg]">
        <div className="rounded-[21px] bg-[#f6f5f1] overflow-hidden border border-white/10">
          <div className="h-9 bg-[#171717] flex items-center gap-2 px-4">
            <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <span className="w-2.5 h-2.5 rounded-full bg-rawi-yellow" />
          </div>
          <div className="grid grid-cols-[128px_1fr] min-h-[500px]">
            <div className="bg-[#101010] text-white p-4 flex flex-col">
              <div className="flex items-center gap-2 font-black tracking-[.12em]"><span className="w-7 h-7 rounded-[50%_50%_50%_8px] bg-rawi-yellow grid place-items-center text-black -rotate-[8deg]">R</span><span className="text-sm">RAWI</span></div>
              <div className="mt-8 space-y-2 text-[10px]"><div className="rounded-lg bg-white/10 px-3 py-2.5">Home</div><div className="px-3 py-2.5 text-white/45">Projects</div><div className="px-3 py-2.5 text-white/45">Analytics</div><div className="px-3 py-2.5 text-white/45">Branding</div></div>
              <div className="mt-auto"><div className="text-[8px] text-white/35 flex justify-between"><span>Storage</span><span>68 / 100 GB</span></div><div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden"><div className="h-full w-[68%] bg-rawi-yellow" /></div></div>
            </div>

            <div className="p-5 md:p-6">
              <div className="flex justify-between gap-4">
                <div><div className="text-[8px] tracking-[.15em] text-gray-400 font-black">CREATOR WORKSPACE</div><h3 className="text-[22px] md:text-[28px] tracking-[-.04em] mt-1">Good morning, RAWI.</h3><p className="text-[10px] text-gray-400 mt-1">Here&apos;s what&apos;s happening with your projects.</p></div>
                <div className="w-8 h-8 rounded-full bg-rawi-yellow grid place-items-center font-black text-xs">R</div>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-5"><MiniStat value="24" label="Projects" /><MiniStat value="1,284" label="Photos" /><MiniStat value="36" label="Clients" /><MiniStat value="98.7K" label="Downloads" /></div>

              <div className="mt-4 rounded-2xl border bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between"><div><div className="text-[10px] font-black">Recent Projects</div><div className="text-[7px] text-gray-400 mt-0.5">Automotive galleries</div></div><span className="text-[7px] text-[#b88600] font-bold">View all</span></div>
                <div className="grid grid-cols-4 gap-2 mt-3">{DEMO_PROJECTS.slice(0, 4).map((project) => <DemoProjectCard key={project.name} project={project} />)}</div>
              </div>

              <div className="grid grid-cols-[1fr_.78fr] gap-3 mt-3">
                <div className="rounded-2xl border bg-white p-3"><div className="text-[9px] font-bold">Client activity</div><div className="grid grid-cols-2 gap-2 mt-3"><ActivityLine icon="↓" text="M3 F80 Silver downloaded" /><ActivityLine icon="◉" text="M3 G80 Orange viewed" /><ActivityLine icon="♡" text="M2 CS Green favorited" /><ActivityLine icon="↓" text="GT3 RS shared" /></div></div>
                <div className="rounded-2xl bg-black text-white p-3"><div className="text-[8px] text-white/45">TODAY DRIVE</div><div className="text-sm mt-1">Gallery is live.</div><div className="grid grid-cols-2 gap-1.5 mt-3"><span className="rounded-lg bg-white/10 px-2 py-2 text-[7px] text-center">Copy link</span><span className="rounded-lg bg-rawi-yellow text-black px-2 py-2 text-[7px] text-center font-bold">WhatsApp</span></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute right-0 bottom-0 w-[37%] min-w-[175px] max-w-[230px] rounded-[34px] border-[7px] border-[#111] bg-[#111] shadow-[0_35px_80px_rgba(0,0,0,.32)] rotate-[4deg] overflow-hidden">
        <div className="rounded-[25px] overflow-hidden bg-[#090909] text-white min-h-[420px]">
          <div className="relative h-[245px] p-4 flex flex-col justify-between bg-cover bg-center" style={{ backgroundImage: `linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.82)),url('${HERO_IMAGE}')` }}>
            <div className="flex items-center gap-2"><span className="w-7 h-7 rounded-[50%_50%_50%_8px] bg-rawi-yellow text-black grid place-items-center font-black -rotate-[8deg] text-xs">R</span><span className="font-black tracking-[.12em] text-[9px]">RAWI</span></div>
            <div><div className="text-[7px] tracking-[.16em] text-rawi-yellow">AUTOMOTIVE</div><h4 className="text-[24px] leading-[.95] tracking-[-.05em] mt-2">Today<br />Drive</h4><button className="mt-3 bg-rawi-yellow text-black rounded-full px-3 py-2 text-[7px] font-bold">View gallery</button></div>
          </div>
          <div className="bg-white text-black p-3">
            <div className="text-[8px] font-bold">Featured collection</div>
            <div className="grid grid-cols-2 gap-1.5 mt-3">{DEMO_PROJECTS.slice(4, 8).map((p) => <div key={p.name} className="h-20 rounded-lg bg-cover bg-center" title={p.name} style={{ backgroundImage: `url('${p.image}')` }} />)}</div>
          </div>
        </div>
      </div>

      <div className="absolute left-[9%] bottom-[3%] rounded-2xl bg-white border border-gray-200 shadow-xl p-3 w-[160px] rotate-[-4deg]"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center">✓</div><div><div className="text-[9px] font-black">Client delivered</div><div className="text-[7px] text-gray-400 mt-0.5">12 files downloaded</div></div></div></div>
    </div>
  );
}

function DemoProjectCard({ project }: { project: { name: string; image: string; meta: string } }) {
  return <div className="overflow-hidden rounded-xl border bg-[#fafafa]"><div className="h-[78px] bg-cover bg-center" style={{ backgroundImage: `linear-gradient(180deg,transparent,rgba(0,0,0,.24)),url('${project.image}')` }} /><div className="p-1.5"><div className="text-[7px] font-black truncate">{project.name}</div><div className="text-[6px] text-gray-400 mt-0.5">{project.meta}</div><div className="text-[6px] text-emerald-600 mt-1">● Published</div></div></div>;
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return <div className="rounded-xl border bg-white p-2.5"><div className="text-base font-black tracking-[-.04em]">{value}</div><div className="text-[7px] text-gray-400 mt-1">{label}</div></div>;
}

function ActivityLine({ icon, text }: { icon: string; text: string }) {
  return <div className="flex items-center gap-2 text-[8px]"><span className="w-5 h-5 rounded-lg bg-[#fff6cf] grid place-items-center">{icon}</span><span className="truncate">{text}</span></div>;
}

export function Strip() {
  return <section className="bg-rawi-yellow overflow-hidden py-3.5"><div className="flex gap-8 justify-center font-black tracking-[0.08em] whitespace-nowrap"><span>UPLOAD</span><b>•</b><span>PRESENT</span><b>•</b><span>DELIVER</span><b>•</b><span>RAWI</span><b>•</b></div></section>;
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
  return <section id="features" className="py-[110px] w-[min(1180px,calc(100%-40px))] mx-auto"><div className="max-w-[760px] mb-12"><div className="text-[11px] font-extrabold tracking-[0.17em] text-gray-500">BUILT AROUND DELIVERY</div><h2 className="text-[36px] md:text-[68px] leading-[1.02] tracking-[-0.055em] my-3">Everything between export and &ldquo;wow&rdquo;.</h2></div><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">{FEATURES.map((f) => <article key={f.title} className="bg-rawi-soft rounded-rawi p-7 min-h-[240px] border border-[#efefed]"><div className="w-[42px] h-[42px] rounded-[13px] bg-black text-rawi-yellow grid place-items-center text-xl mb-[42px]">{f.icon}</div><h3 className="text-xl mb-2.5">{f.title}</h3><p className="text-gray-500 leading-relaxed">{f.body}</p></article>)}</div></section>;
}

export function GalleryDemo() {
  return (
    <section id="gallery" className="bg-[#090909] text-white py-[110px]">
      <div className="w-[min(1180px,calc(100%-40px))] mx-auto">
        <div className="max-w-[760px] mb-12"><div className="text-[11px] font-extrabold tracking-[0.17em] text-gray-500">CLIENT EXPERIENCE</div><h2 className="text-[36px] md:text-[68px] leading-[1.02] tracking-[-0.055em] my-3">Not a folder. A presentation.</h2><p className="text-gray-400 max-w-[620px] text-lg">Give clients a branded experience that feels like part of the shoot—not an afterthought.</p></div>

        <div className="rounded-[34px] bg-[#111] border border-[#222] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
          <div className="h-10 border-b border-white/10 flex items-center gap-2 px-4"><span className="w-2.5 h-2.5 rounded-full bg-white/15" /><span className="w-2.5 h-2.5 rounded-full bg-white/15" /><span className="w-2.5 h-2.5 rounded-full bg-rawi-yellow" /><div className="ml-3 text-[8px] text-white/35">rawi.gallery/today-drive</div></div>
          <div className="relative min-h-[420px] p-7 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(180deg,rgba(0,0,0,.10),rgba(0,0,0,.82)),url('${HERO_IMAGE}')` }}>
            <div className="flex items-center justify-between text-[10px]"><div className="flex items-center gap-2"><span className="w-7 h-7 rounded-[50%_50%_50%_8px] bg-rawi-yellow text-black grid place-items-center font-black">R</span><span className="font-bold">RAWI</span></div><span className="text-white/45">Delivered with RAWI</span></div>
            <div className="absolute left-7 bottom-7"><span className="text-[9px] tracking-[.18em] text-rawi-yellow">AUTOMOTIVE</span><h3 className="text-5xl tracking-[-.06em] mt-2">Today Drive</h3><p className="text-white/55 text-sm mt-2">A curated automotive collection</p></div>
          </div>

          <div className="p-5 md:p-7">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {DEMO_PROJECTS.map((p) => <div key={p.name} className="relative h-40 md:h-48 rounded-xl overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url('${p.image}')` }}><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" /><div className="absolute left-3 bottom-3"><div className="text-xs font-bold">{p.name}</div><div className="text-[9px] text-white/50 mt-1">{p.meta}</div></div></div>)}
            </div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-t border-white/10 mt-6 pt-5 gap-4"><div><div className="font-bold">8 unique automotive stories</div><div className="text-xs text-white/40">Every gallery gets its own visual identity.</div></div><button className="bg-rawi-yellow text-black rounded-full px-5 py-3 text-xs font-extrabold">View collection ↓</button></div>
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
  return <section id="pricing" className="py-[110px] w-[min(1180px,calc(100%-40px))] mx-auto"><div className="max-w-[760px] mb-12"><div className="text-[11px] font-extrabold tracking-[0.17em] text-gray-500">SIMPLE PRICING</div><h2 className="text-[36px] md:text-[68px] leading-[1.02] tracking-[-0.055em] my-3">Start free. Grow when your archive does.</h2></div><div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">{PLANS.map((p) => <article key={p.plan} className={`rounded-[24px] p-7 flex flex-col justify-between min-h-[450px] relative border ${p.featured ? "border-2 border-black shadow-[0_20px_60px_rgba(0,0,0,0.08)]" : "border-gray-200"}`}>{p.featured && <div className="absolute top-3 right-3 text-[9px] bg-rawi-yellow px-2.5 py-1.5 rounded-full font-black tracking-[0.08em]">MOST POPULAR</div>}<div><span className="text-[11px] font-black tracking-[0.12em] text-gray-500">{p.plan}</span><h3 className="text-[46px] md:text-[54px] my-4 tracking-[-0.06em]">{p.price} <small className="text-[13px] text-gray-500 tracking-normal">{p.suffix}</small></h3><p className="text-gray-500">{p.desc}</p><ul className="p-0 my-6 list-none">{p.features.map((f) => <li key={f} className="py-2.5 border-b border-gray-100 text-sm">{f}</li>)}</ul></div><Link href="/signup" className={`text-center rounded-full px-5 py-[13px] font-extrabold ${p.featured ? "bg-rawi-yellow text-black" : "bg-white border border-gray-300 text-black"}`}>Choose {p.plan.charAt(0) + p.plan.slice(1).toLowerCase()}</Link></article>)}</div></section>;
}

export function ClosingCTA() {
  return <section className="bg-rawi-yellow py-[70px]"><div className="w-[min(1180px,calc(100%-40px))] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-7"><div><div className="text-[11px] font-extrabold tracking-[0.17em] text-[#504500]">RAWI • راوي</div><h2 className="text-[32px] md:text-[48px] leading-none my-2.5 tracking-[-0.05em]">Make delivery part of the creative work.</h2></div><Link href="/signup" className="bg-white text-black font-extrabold rounded-full px-5 py-[13px] whitespace-nowrap">Build your first gallery</Link></div></section>;
}
