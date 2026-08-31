"use client";
import { Reveal } from "@/components/landing/Reveal";

const SUPPORTING_FEATURES = [
  {
    number: "03",
    icon: "◉",
    title: "Share in one click.",
    body: "Send a polished gallery link instantly on WhatsApp — the channel your clients already use.",
    badge: "✓ 1-Click WhatsApp",
  },
  {
    number: "04",
    icon: "♡",
    title: "Client favorites & approvals.",
    body: "Let clients favorite photos, approve edits and make final selections in one place.",
    badge: "✓ Favorites & Selections",
  },
  {
    number: "05",
    icon: "✦",
    title: "Your brand, your way.",
    body: "Add your logo, colors and gallery cover. RAWI stays quietly in the background.",
    badge: "✓ Creator Branding",
  },
  {
    number: "06",
    icon: "ع",
    title: "Arabic + English.",
    body: "Native bilingual experience with RTL support and regional-first details.",
    badge: "ع / ENG",
  },
];

export function EnhancedFeatures() {
  return (
    <section id="features" className="bg-[#06060F] pt-[72px] pb-0 md:pt-[110px]">
      <div className="w-[min(1180px,calc(100%-32px))] md:w-[min(1180px,calc(100%-40px))] mx-auto">
        <div className="grid lg:grid-cols-[.72fr_1.28fr] gap-10 lg:gap-14 items-end mb-10">
          <div>
            <Reveal><div className="editorial-eyebrow mb-4">BUILT AROUND DELIVERY</div></Reveal>
            <Reveal delay={1}><h2 className="display-section mt-4 max-w-[650px]">From final export<br />to <span style={{color:"#C9962A"}}>happy client.</span></h2></Reveal>
          </div>
          <div className="lg:pb-2">
            <p className="text-lg leading-relaxed text-white/45 max-w-[610px]">
              RAWI handles the delivery, presentation, feedback and downloads — so your work feels premium until the very last click.
            </p>
            <div className="grid grid-cols-3 gap-2 mt-7 sm:gap-4 max-w-[560px]">
              <MiniBenefit icon="▣" title="Photo + video" body="Up to 500 MB/file" />
              <MiniBenefit icon="↥" title="Resumable" body="Never restart" />
              <MiniBenefit icon="◇" title="Secure" body="Files protected" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <HeroFeature
            number="01"
            eyebrow="FAST DELIVERY"
            title={<>Fast delivery,<br /><span className="text-[#e5b800]">zero interruptions.</span></>}
            body="Resumable uploads for photo sets and supported video files up to 500 MB each. Pick up where you left off."
            badges={["✓ Resumable Uploads", "✓ Photos + Video"]}
            visual={<UploadVisual />}
          />
          <HeroFeature
            number="02"
            eyebrow="CLIENT EXPERIENCE"
            title={<>Beautiful galleries<br />that <span className="text-[#e5b800]">impress.</span></>}
            body="Polished gallery previews for clients, while original uploaded files remain ready to download."
            badges={["✓ Gallery Preview", "✓ Original Downloads"]}
            visual={<GalleryVisual />}
          />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {SUPPORTING_FEATURES.map((feature) => (
            <article
              key={feature.number}
              className="tilt-card group rounded-[22px] border border-white/8 bg-[#0C0C1A] p-5 sm:p-6 min-h-0 sm:min-h-[255px] shadow-[0_10px_35px_rgba(0,0,0,.2)] transition duration-300 hover:-translate-y-1.5 hover:border-rawi-yellow/20 hover:shadow-[0_0_40px_rgba(255,212,0,0.07),0_18px_45px_rgba(0,0,0,.5)]"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="bg-rawi-yellow text-black rounded-md px-2 py-1 text-[9px] font-black">{feature.number}</span>
                <span className="w-12 h-12 rounded-[15px] bg-[#06060F] text-rawi-yellow grid place-items-center text-xl font-black transition-transform duration-300 group-hover:scale-105">{feature.icon}</span>
              </div>
              <h3 className="text-[22px] leading-[1.08] tracking-[-.035em] font-bold mt-6 text-[#F0EFFF]">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-white/45 mt-3">{feature.body}</p>
              <span className="inline-flex rounded-full bg-rawi-yellow/10 px-3 py-1.5 text-[10px] font-bold mt-5 text-rawi-yellow">{feature.badge}</span>
            </article>
          ))}
        </div>
      </div>

      <div className="relative left-1/2 mt-14 md:mt-20 w-screen -translate-x-1/2 overflow-hidden border-y border-white/8 bg-[#0A0A18] py-7 md:py-9">
        <div className="mb-5 md:mb-7 text-center text-[10px] font-extrabold tracking-[0.2em] text-white/25">
          PHOTOGRAPHY &amp; FILMMAKING GEAR
        </div>
        <div className="rawi-gear-track flex w-max items-center">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center gap-14 pr-14 md:gap-20 md:pr-20 text-gray-500/50 grayscale select-none" aria-hidden={copy === 1}>
              {["SONY", "Canon", "Nikon", "FUJIFILM", "LUMIX", "Leica", "HASSELBLAD", "SIGMA", "TAMRON", "ZEISS", "dji", "GoPro", "Insta360", "OM SYSTEM", "PENTAX", "ARRI", "RED", "Blackmagicdesign"].map((brand) => (
                <span key={brand} className="whitespace-nowrap text-[22px] md:text-[27px] font-black tracking-[-0.055em] text-white/20">{brand}</span>
              ))}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0A0A18] to-transparent md:w-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0A0A18] to-transparent md:w-40" />
      </div>
    </section>
  );
}

function HeroFeature({ number, eyebrow, title, body, badges, visual }: { number: string; eyebrow: string; title: React.ReactNode; body: string; badges: string[]; visual: React.ReactNode }) {
  return (
    <article className="group relative overflow-hidden rounded-[24px] md:rounded-[28px] border border-white/8 bg-[#0C0C1A] min-h-0 p-5 sm:p-7 md:min-h-[360px] md:p-8 shadow-[0_12px_40px_rgba(0,0,0,.3)] transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:shadow-[0_22px_55px_rgba(0,0,0,.5)]">
      <div className="grid md:grid-cols-[1.05fr_.95fr] gap-3 md:gap-5 h-full items-center">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="bg-rawi-yellow text-black rounded-md px-2 py-1 text-[9px] font-black">{number}</span>
            <span className="text-[9px] tracking-[.14em] text-white/35 font-black">{eyebrow}</span>
          </div>
          <h3 className="text-[30px] md:text-[35px] leading-[1.02] tracking-[-.05em] mt-5">{title}</h3>
          <p className="text-sm leading-relaxed text-white/45 mt-4 max-w-[390px]">{body}</p>
          <div className="flex flex-wrap gap-2 mt-6">{badges.map((badge) => <span key={badge} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-bold text-white/70">{badge}</span>)}</div>
        </div>
        <div className="relative min-h-[180px] md:min-h-[220px]">{visual}</div>
      </div>
    </article>
  );
}

function UploadVisual() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative w-[190px] h-[150px]">
        <div className="absolute left-8 top-8 w-32 h-24 rounded-[38px] bg-white/5 border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,.3)]" />
        <div className="absolute left-2 top-16 w-20 h-16 rounded-full bg-white/5 border border-white/10" />
        <div className="absolute right-4 top-15 w-20 h-16 rounded-full bg-white/5 border border-white/10" />
        <div className="absolute inset-0 grid place-items-center text-[56px] text-[#e5b800] font-black -translate-y-1">↑</div>
        <div className="absolute left-7 right-2 bottom-0 rounded-2xl bg-[#1e1e1e] border border-white/10 px-4 py-3 shadow-lg">
          <div className="flex justify-between text-[10px] font-bold text-white/70"><span>Uploading masters</span><span>78%</span></div>
          <div className="h-2 rounded-full bg-white/10 mt-2 overflow-hidden"><div className="h-full w-[78%] bg-rawi-yellow rounded-full" /></div>
        </div>
      </div>
    </div>
  );
}

function GalleryVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-full max-w-[250px]">
        <div className="rounded-[18px] border-[6px] border-[#151515] overflow-hidden bg-[#111] shadow-[0_18px_45px_rgba(0,0,0,.18)]">
          <div className="aspect-[1.55] bg-[radial-gradient(circle_at_58%_48%,rgba(255,212,0,.2),transparent_18%),linear-gradient(145deg,#4a4a4a,#0a0a0a_60%,#2c2c2c)] relative">
            <div className="absolute inset-0 grid place-items-center"><span className="w-12 h-12 rounded-full bg-black/70 text-white grid place-items-center text-lg">▶</span></div>
            <div className="absolute left-3 bottom-3 text-white"><div className="text-[7px] text-white/50 tracking-[.15em]">RAWI GALLERY</div><div className="text-sm mt-1">Today Drive</div></div>
          </div>
        </div>
        <div className="absolute -right-6 -bottom-8 w-[70px] rounded-[16px] border-[4px] border-[#151515] bg-[#111] p-1 shadow-xl">
          <div className="h-20 rounded-[10px] bg-gradient-to-br from-gray-500 via-gray-800 to-black" />
          <div className="grid grid-cols-2 gap-1 mt-1"><div className="h-6 rounded bg-gray-700" /><div className="h-6 rounded bg-gray-500" /></div>
        </div>
      </div>
    </div>
  );
}

function MiniBenefit({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="border-l border-white/10 first:border-l-0 first:pl-0 pl-2 sm:pl-4">
      <div className="text-xl text-[#d4aa00]">{icon}</div>
      <div className="text-xs font-extrabold mt-2 text-[#F0EFFF]">{title}</div>
      <div className="text-[10px] text-white/35 mt-1">{body}</div>
    </div>
  );
}
