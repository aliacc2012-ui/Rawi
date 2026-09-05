"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const PHOTOS = [
  { id: "f80-silver", name: "M3 F80 Silver", image: "https://cdn.myportfolio.com/73cfc9a0-30aa-4f01-b629-e720c0fd6095/8f46a7d7-574d-49f7-bf22-7724d30b43c7_rw_3840.jpg?h=aff02d94bbfa6aa57cbc0cc93684aaf6" },
  { id: "g80-orange", name: "M3 G80 Orange", image: "https://cdn.bmwblog.com/wp-content/uploads/2021/04/MG_4274-Edit-scaled.jpg" },
  { id: "m2-green", name: "M2 CS Green", image: "https://images.collectingcars.com/014485/DSC08641.jpg?auto=format%2Ccompress&cs=srgb&fit=fillmax&q=85" },
  { id: "gt3-yellow", name: "Porsche GT3 RS", image: "https://uhdwalls.com/2025/porsche-911-gt3-rs-yellow-beast/porsche-911-gt3-rs-yellow-beast-2048x2048.jpg" },
  { id: "f80-red", name: "M3 F80 Red", image: "https://img.goodfon.com/original/2048x1280/2/50/bmw-m3-f80-red-road-autumn-forest.jpg" },
  { id: "gt4", name: "Porsche GT4", image: "https://www.supercars.net/blog/wp-content/uploads/2020/07/2020-Porsche-718-Cayman-GT4-001-1600.jpg" },
  { id: "huracan", name: "Lamborghini Huracán STO", image: "https://hips.hearstapps.com/hmg-prod/images/2021-lamborghini-huracan-sto-114-1640358044.jpg?crop=1xw%3A1xh%3Bcenter%2Ctop&resize=980%3A%2A" },
  { id: "ferrari", name: "Ferrari 296 GTB", image: "https://www.soldoutservice.com/wp-content/uploads/2022/09/ferrari-296-gbt-1.jpg" },
];

export function TodayDriveDemo() {
  const [selected, setSelected] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (selected === null) return;
      if (event.key === "Escape") setSelected(null);
      if (event.key === "ArrowRight") setSelected((selected + 1) % PHOTOS.length);
      if (event.key === "ArrowLeft") setSelected((selected - 1 + PHOTOS.length) % PHOTOS.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  function toggleFavorite(id: string) {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  const selectedPhoto = selected === null ? null : PHOTOS[selected] ?? null;

  async function share() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-black/65 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-[min(1200px,calc(100%-32px))] items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black tracking-[.12em]">
            <span className="grid h-9 w-9 -rotate-[8deg] place-items-center rounded-[50%_50%_50%_8px] bg-rawi-yellow text-sm text-black">R</span>
            RAWI
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-[10px] font-bold tracking-[.14em] text-white/45 sm:inline">LIVE DEMO</span>
            <button onClick={share} className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold hover:bg-white hover:text-black">{copied ? "Link copied ✓" : "Share gallery"}</button>
          </div>
        </div>
      </header>

      <section className="relative min-h-[76vh] overflow-hidden pt-16">
        <img src={PHOTOS[6]!.image} alt="Lamborghini Huracán STO" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-[#0b0b0b]" />
        <div className="relative mx-auto flex min-h-[calc(76vh-64px)] w-[min(1200px,calc(100%-32px))] items-end pb-12 md:pb-16">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 py-2 text-[10px] font-extrabold tracking-[.14em] backdrop-blur-md"><span className="h-2 w-2 rounded-full bg-rawi-yellow" />AUTOMOTIVE COLLECTION</div>
            <h1 className="text-[54px] font-medium leading-[.88] tracking-[-.065em] sm:text-[74px] md:text-[104px]">Today<br />Drive</h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-white/65 md:text-base">A curated collection of performance cars, presented as your client would experience it.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-[min(1200px,calc(100%-32px))] pb-20 pt-8 md:pt-14">
        <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[10px] font-bold tracking-[.16em] text-rawi-yellow">FEATURED COLLECTION</p><h2 className="mt-2 text-3xl tracking-[-.04em] md:text-4xl">Eight automotive stories.</h2></div>
          <p className="text-sm text-white/45">{favorites.length ? `${favorites.length} selected for the creator` : "Tap ♡ to make your selections"}</p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {PHOTOS.map((photo, index) => (
            <article key={photo.id} className={`group relative overflow-hidden rounded-2xl bg-white/5 ${index === 0 || index === 5 ? "col-span-2" : ""}`}>
              <button onClick={() => setSelected(index)} className="block h-full w-full text-left" aria-label={`Open ${photo.name}`}>
                <img src={photo.image} alt={photo.name} loading="lazy" className={`w-full object-cover transition duration-700 group-hover:scale-[1.03] ${index === 0 || index === 5 ? "h-[280px] sm:h-[390px]" : "h-[220px] sm:h-[320px]"}`} />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-4 pb-4 pt-14 text-sm font-bold">{photo.name}</span>
              </button>
              <button onClick={() => toggleFavorite(photo.id)} aria-label={favorites.includes(photo.id) ? `Remove ${photo.name} from favorites` : `Favorite ${photo.name}`} className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border backdrop-blur-md transition ${favorites.includes(photo.id) ? "border-rawi-yellow bg-rawi-yellow text-black" : "border-white/25 bg-black/30 text-white hover:bg-white hover:text-black"}`}>{favorites.includes(photo.id) ? "♥" : "♡"}</button>
            </article>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center rounded-[28px] border border-white/10 bg-white/[.04] px-5 py-10 text-center">
          <p className="text-xs font-bold tracking-[.14em] text-rawi-yellow">PRESENTED WITH RAWI</p>
          <h2 className="mt-3 text-3xl tracking-[-.04em]">Ready to present your own work?</h2>
          <Link href="/signup" className="mt-6 rounded-full bg-rawi-yellow px-6 py-3.5 text-sm font-black text-black">Build your first gallery →</Link>
        </div>
      </section>

      {selected !== null && selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4" role="dialog" aria-modal="true" aria-label={selectedPhoto.name}>
          <button onClick={() => setSelected(null)} className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/50 text-xl" aria-label="Close preview">×</button>
          <button onClick={() => setSelected((selected - 1 + PHOTOS.length) % PHOTOS.length)} className="absolute left-3 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/50 text-xl md:left-6" aria-label="Previous photo">←</button>
          <img src={selectedPhoto.image} alt={selectedPhoto.name} className="max-h-[86vh] max-w-[92vw] rounded-xl object-contain" />
          <button onClick={() => setSelected((selected + 1) % PHOTOS.length)} className="absolute right-3 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/50 text-xl md:right-6" aria-label="Next photo">→</button>
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/70 px-4 py-2.5 text-xs backdrop-blur-md">
            <span>{selectedPhoto.name}</span><span className="text-white/30">•</span><span>{selected + 1} / {PHOTOS.length}</span>
          </div>
        </div>
      )}
    </main>
  );
}
