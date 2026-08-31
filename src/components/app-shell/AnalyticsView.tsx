"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { EyeIcon, DownloadIcon, HeartIcon, PublishIcon, TrendIcon, ChartIcon, LockIcon, GalleryIcon } from "@/components/ui/AppIcons";

type Gallery = { id: string; title: string; views: number; downloads: number; favorites: number };
type Props = {
  plan: string; views: number; downloads: number; favorites: number;
  published: number; engagement: number; byGallery: Gallery[];
  totalGalleries: number; paidAnalytics: boolean;
};

function useCountUp(target: number, duration = 1400, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    let startTime: number | null = null;
    let raf: number;
    const tick = (ts: number) => {
      if (!startTime) startTime = ts + delay;
      const elapsed = Math.max(0, ts - startTime);
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setVal(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setVal(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);
  return val;
}

function AnimBar({ pct, delay }: { pct: number; delay: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 120 + delay * 60);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div className="h-1.5 bg-white/[.05] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-violet-500 via-violet-400 to-fuchsia-400"
        style={{ width: `${width}%`, transition: "width 0.9s cubic-bezier(0.16,1,0.3,1)" }}
      />
    </div>
  );
}

function StatTile({ label, value, suffix = "", Icon, accent = false, color = "", delay = 0 }:
  { label: string; value: number; suffix?: string; Icon: React.ComponentType<{ className?: string }>; accent?: boolean; color?: string; delay?: number }) {
  const count = useCountUp(value, 1400, delay);
  return (
    <div className={`rounded-[18px] border p-5 transition-all duration-300 ${accent ? "bg-rawi-yellow/[.08] border-rawi-yellow/25 hover:border-rawi-yellow/40" : "bg-rawi-panel border-white/[.07] hover:border-white/[.15]"}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] text-white/40 font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-xl grid place-items-center ${accent ? "bg-rawi-yellow/20 text-rawi-yellow" : color || "bg-white/[.05] text-white/40"}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className={`font-cormorant text-[48px] leading-none font-bold tracking-[-0.03em] ${accent ? "text-rawi-yellow" : "text-[#F0EFFF]"}`}>
        {count}{suffix}
      </div>
    </div>
  );
}

function LockedTile({ label }: { label: string }) {
  return (
    <div className="rounded-[18px] border border-white/[.05] bg-rawi-panel/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] text-white/25 font-medium">{label}</span>
        <LockIcon className="h-4 w-4 text-white/20" />
      </div>
      <div className="h-10 w-20 rounded-xl bg-white/[.06] animate-pulse" />
    </div>
  );
}

export function AnalyticsView({ plan, views, downloads, favorites, published, engagement, byGallery, totalGalleries, paidAnalytics }: Props) {
  const top = byGallery[0];
  const maxActivity = Math.max(1, ...byGallery.map((g) => g.views + g.downloads + g.favorites));

  return (
    <div className="max-w-[1500px] mx-auto pb-8 relative">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-5%] left-[15%] w-[500px] h-[500px] rounded-full bg-violet-600/[.06] blur-[120px]" />
        <div className="absolute top-[40%] right-[-5%] w-[380px] h-[380px] rounded-full bg-cyan-500/[.04] blur-[100px]" />
        <div className="absolute bottom-[5%] left-[5%] w-[300px] h-[300px] rounded-full bg-rawi-yellow/[.04] blur-[90px]" />
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-[11px] font-extrabold tracking-[0.18em] text-white/30">{plan} WORKSPACE</span>
          <h1 className="font-cormorant text-[56px] md:text-[72px] tracking-[-0.03em] leading-none mt-2 flex items-center gap-3 text-[#F0EFFF]">
            <ChartIcon className="h-10 w-10 text-white/30" />Analytics
          </h1>
          <p className="text-white/40 mt-2 text-sm">See how clients engage with your galleries and delivered work.</p>
        </div>
        <div className="rounded-full bg-rawi-panel border border-white/[.07] px-4 py-2 text-xs font-bold text-white/40">All time</div>
      </div>

      {/* Stat tiles */}
      {paidAnalytics ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <StatTile label="Gallery views" value={views} Icon={EyeIcon} color="bg-violet-500/10 text-violet-400" delay={0} />
          <StatTile label="Downloads" value={downloads} Icon={DownloadIcon} color="bg-cyan-500/10 text-cyan-400" delay={80} />
          <StatTile label="Favorites" value={favorites} Icon={HeartIcon} color="bg-rose-500/10 text-rose-400" delay={160} />
          <StatTile label="Published" value={published} Icon={PublishIcon} color="bg-emerald-500/10 text-emerald-400" delay={240} />
          <StatTile label="Engagement" value={engagement} suffix="%" Icon={TrendIcon} accent delay={320} />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <StatTile label="Gallery views" value={views} Icon={EyeIcon} color="bg-violet-500/10 text-violet-400" delay={0} />
          <StatTile label="Published" value={published} Icon={PublishIcon} color="bg-emerald-500/10 text-emerald-400" delay={80} />
          <StatTile label="Total galleries" value={totalGalleries} Icon={GalleryIcon} delay={160} />
        </div>
      )}

      {/* Free upsell */}
      {!paidAnalytics && (
        <div className="relative overflow-hidden rounded-[24px] border border-white/[.07] bg-rawi-panel p-6 md:p-8 mb-6">
          <div className="absolute right-[-70px] top-[-90px] h-64 w-64 rounded-full bg-rawi-yellow/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <span className="text-[10px] font-extrabold tracking-[.18em] text-rawi-yellow">CREATOR ANALYTICS</span>
            <h2 className="mt-3 font-cormorant text-[40px] md:text-[52px] tracking-[-0.03em] flex items-center gap-3 text-[#F0EFFF]">
              <ChartIcon className="h-8 w-8" />Know what clients actually engage with.
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/40">Upgrade to unlock downloads, favorites, engagement rate and gallery-by-gallery performance.</p>
            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              {["Downloads", "Favorites", "Engagement"].map((l) => <LockedTile key={l} label={l} />)}
            </div>
            <Link href="/settings" className="mt-6 inline-flex rounded-xl bg-rawi-yellow px-5 py-3 text-sm font-extrabold text-black hover:bg-rawi-yellow/90 transition">
              View upgrade options →
            </Link>
          </div>
        </div>
      )}

      {/* Paid: performance + top gallery */}
      {paidAnalytics && (
        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_.6fr] gap-5">
          {/* Gallery performance */}
          <div className="bg-rawi-panel border border-white/[.07] rounded-[22px] p-6">
            <div className="flex items-start justify-between gap-3 mb-7">
              <div>
                <h2 className="font-cormorant text-[28px] tracking-[-0.03em] flex items-center gap-2 text-[#F0EFFF]">
                  <ChartIcon className="h-6 w-6" />Gallery performance
                </h2>
                <p className="text-xs text-white/40 mt-1">Relative activity across your published work.</p>
              </div>
              <span className="text-[10px] text-white/30 font-semibold tracking-wider mt-1">VIEWS + DOWNLOADS + FAVORITES</span>
            </div>
            {byGallery.length > 0 ? (
              <div className="space-y-6">
                {byGallery.slice(0, 8).map((g, i) => {
                  const activity = g.views + g.downloads + g.favorites;
                  const pct = Math.max(5, (activity / maxActivity) * 100);
                  return (
                    <div key={g.id}>
                      <div className="flex items-center justify-between text-sm mb-2.5">
                        <span className="font-bold text-[#F0EFFF]">{g.title}</span>
                        <span className="text-white/35 text-xs">{g.views}v · {g.downloads}d · {g.favorites}f</span>
                      </div>
                      <AnimBar pct={pct} delay={i} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center text-sm text-white/30 border border-dashed border-white/[.08] rounded-2xl">
                Publish and share a gallery to start collecting data.
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Top gallery card */}
            <div className="rounded-[22px] bg-[#08080F] border border-white/[.07] text-white p-6 min-h-[220px] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(167,139,250,0.15),transparent_60%)]" />
              <div className="relative">
                <span className="text-[10px] tracking-[.17em] text-rawi-yellow font-bold inline-flex items-center gap-2">
                  <TrendIcon className="h-3.5 w-3.5" />TOP GALLERY
                </span>
                <h2 className="font-cormorant text-[34px] tracking-[-0.03em] mt-3 leading-tight">
                  {top?.title ?? "No activity yet"}
                </h2>
              </div>
              <div className="relative grid grid-cols-3 gap-3 mt-6">
                {[
                  { label: "Views", val: top?.views ?? 0, color: "text-violet-400" },
                  { label: "Downloads", val: top?.downloads ?? 0, color: "text-cyan-400" },
                  { label: "Favorites", val: top?.favorites ?? 0, color: "text-rose-400" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="rounded-xl bg-white/[.05] border border-white/[.06] p-3">
                    <div className="text-[10px] text-white/40">{label}</div>
                    <div className={`font-cormorant text-[28px] leading-none font-bold mt-1 ${color}`}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* What to watch */}
            <div className="bg-rawi-panel border border-white/[.07] rounded-[22px] p-6">
              <h2 className="font-cormorant text-[24px] tracking-[-0.02em] flex items-center gap-2 text-[#F0EFFF] mb-5">
                <ChartIcon className="h-5 w-5" />What to watch
              </h2>
              <div className="space-y-4">
                {[
                  { Icon: EyeIcon, title: "Views", text: "How many times clients opened your galleries.", color: "bg-violet-500/10 text-violet-400" },
                  { Icon: DownloadIcon, title: "Downloads", text: "A strong signal that delivery is complete.", color: "bg-cyan-500/10 text-cyan-400" },
                  { Icon: HeartIcon, title: "Favorites", text: "Shows which work connects most with clients.", color: "bg-rose-500/10 text-rose-400" },
                ].map(({ Icon, title, text, color }) => (
                  <div key={title} className="flex gap-3 items-start">
                    <div className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#F0EFFF]">{title}</div>
                      <div className="text-xs text-white/35 mt-0.5 leading-relaxed">{text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
