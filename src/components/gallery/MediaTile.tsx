"use client";

import { useEffect, useState } from "react";
import { getSignedMediaUrl, toggleFavorite } from "@/app/g/[slug]/actions";

type DisplayMode = "grid" | "masonry" | "large" | "slideshow";

export function MediaTile({ mediaId, galleryId, mediaType, favoritesEnabled, downloadsEnabled, initiallyFavorited, selectable = false, selected = false, onToggleSelect, displayMode = "grid" }: {
  mediaId: string; galleryId: string; mediaType: "image" | "video" | "raw"; favoritesEnabled: boolean; downloadsEnabled: boolean; initiallyFavorited: boolean; selectable?: boolean; selected?: boolean; onToggleSelect?: () => void; displayMode?: DisplayMode;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(initiallyFavorited);
  const [error, setError] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    let cancelled = false;
    getSignedMediaUrl(mediaId, false).then((res) => {
      if (cancelled) return;
      if ("url" in res && res.url) setUrl(res.url);
      else setError(("error" in res && res.error) || "Couldn't load this file.");
    });
    return () => { cancelled = true; };
  }, [mediaId]);

  useEffect(() => {
    if (!viewerOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeViewer();
      if (event.key === "+" || event.key === "=") setZoom((value) => Math.min(3, value + 0.25));
      if (event.key === "-") setZoom((value) => Math.max(0.5, value - 0.25));
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", handleKeyDown); };
  }, [viewerOpen]);

  async function handleFavorite() {
    const result = await toggleFavorite(galleryId, mediaId, favorited);
    if (!("error" in result)) setFavorited(Boolean(result.favorited));
  }

  async function handleDownload() {
    const result = await getSignedMediaUrl(mediaId, true);
    if ("error" in result) { setError(result.error ?? null); return; }
    window.location.href = result.url!;
  }

  function openViewer() { if (!url || mediaType === "raw") return; setZoom(1); setViewerOpen(true); }
  function closeViewer() { setViewerOpen(false); setZoom(1); }

  const isFluid = displayMode === "masonry" || displayMode === "large";
  const isShowcase = displayMode === "large" || displayMode === "slideshow";
  const shellClass = isFluid ? "relative rounded-xl overflow-hidden bg-[#111] group ring-offset-2 ring-offset-[#090909] transition" : `relative rounded-xl overflow-hidden bg-[#111] ${displayMode === "slideshow" ? "aspect-[16/10] md:aspect-[16/9]" : "aspect-[4/3]"} group ring-offset-2 ring-offset-[#090909] transition`;
  const mediaClass = isFluid ? "w-full h-auto object-contain" : "w-full h-full object-cover";

  return (
    <>
      <div className={`${shellClass} ${selected ? "ring-2 ring-rawi-yellow" : "ring-0"}`}>
        {url ? mediaType === "video" ? <video src={url} controls className={isFluid ? "w-full h-auto" : "w-full h-full object-cover"} /> : mediaType === "raw" ? <div className={`${isFluid ? "min-h-48" : "w-full h-full"} grid place-items-center text-sm text-gray-400`}>RAW file</div> : <button type="button" onClick={openViewer} aria-label="View image" className={`block w-full ${isFluid ? "h-auto" : "h-full"} cursor-zoom-in`}><img src={url} alt="" loading="lazy" className={mediaClass} /></button> : error ? <div className={`${isFluid ? "min-h-48" : "w-full h-full"} grid place-items-center text-xs text-gray-500 p-2 text-center`}>{error}</div> : <div className={`${isFluid ? "min-h-48" : "w-full h-full"} animate-pulse bg-[#1a1a1a]`} />}

        {selectable && <button type="button" onClick={(event) => { event.stopPropagation(); onToggleSelect?.(); }} aria-label={selected ? "Deselect file" : "Select file"} className={`absolute top-2 left-2 z-10 w-8 h-8 rounded-full grid place-items-center border text-sm font-black backdrop-blur transition ${selected ? "bg-rawi-yellow border-rawi-yellow text-black" : "bg-black/50 border-white/40 text-white hover:border-white"}`}>{selected ? "✓" : ""}</button>}

        <div className={`absolute top-2 right-2 flex gap-1.5 ${isShowcase ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
          {url && mediaType !== "raw" && <button type="button" onClick={openViewer} aria-label="View" className="w-8 h-8 rounded-full grid place-items-center text-sm bg-black/50 text-white backdrop-blur">⛶</button>}
          {favoritesEnabled && <button type="button" onClick={handleFavorite} aria-label={favorited ? "Remove favorite" : "Favorite"} className={`w-8 h-8 rounded-full grid place-items-center text-sm backdrop-blur ${favorited ? "bg-rawi-yellow text-black" : "bg-black/50 text-white"}`}>{favorited ? "♥" : "♡"}</button>}
          {downloadsEnabled && <button type="button" onClick={handleDownload} aria-label="Download" className="w-8 h-8 rounded-full grid place-items-center text-sm bg-black/50 text-white backdrop-blur">↓</button>}
        </div>
      </div>

      {viewerOpen && url && <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col" role="dialog" aria-modal="true" aria-label="Media viewer" onClick={closeViewer}>
        <div className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-white/10">
          <span className="text-white/60 text-xs">RAWI Viewer</span>
          <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
            {mediaType === "image" && <><button type="button" onClick={() => setZoom((v) => Math.max(0.5, v - 0.25))} className="h-9 min-w-9 px-3 rounded-full bg-white/10 text-white">−</button><button type="button" onClick={() => setZoom(1)} className="h-9 px-3 rounded-full bg-white/10 text-white text-xs">{Math.round(zoom * 100)}%</button><button type="button" onClick={() => setZoom((v) => Math.min(3, v + 0.25))} className="h-9 min-w-9 px-3 rounded-full bg-white/10 text-white">+</button></>}
            {downloadsEnabled && <button type="button" onClick={handleDownload} className="h-9 px-4 rounded-full bg-white/10 text-white text-xs">Download</button>}
            <button type="button" onClick={closeViewer} className="h-9 min-w-9 px-3 rounded-full bg-white text-black font-bold">×</button>
          </div>
        </div>
        <div className="flex-1 overflow-auto grid place-items-center p-4 md:p-8" onClick={(event) => event.stopPropagation()}>{mediaType === "video" ? <video src={url} controls autoPlay className="max-w-full max-h-[calc(100vh-7rem)]" /> : <img src={url} alt="" draggable={false} style={{ transform: `scale(${zoom})` }} className="max-w-full max-h-[calc(100vh-7rem)] object-contain transition-transform duration-150 origin-center select-none" />}</div>
      </div>}
    </>
  );
}
