"use client";

import { useMemo, useState } from "react";
import { getBulkDownloadUrls } from "@/app/g/[slug]/actions";
import { MediaTile } from "@/components/gallery/MediaTile";

type ViewMode = "grid" | "masonry" | "large" | "slideshow";
type MediaItem = { id: string; media_type: "image" | "video" | "raw" };
type GallerySection = { id: string; title: string; media: MediaItem[] };

const VIEW_OPTIONS: { id: ViewMode; label: string; icon: string }[] = [
  { id: "grid", label: "Grid", icon: "▦" },
  { id: "masonry", label: "Masonry", icon: "▥" },
  { id: "large", label: "Large", icon: "▭" },
  { id: "slideshow", label: "Slideshow", icon: "▶" },
];

export function GalleryMediaGrid({ galleryId, sections, favoritesEnabled, downloadsEnabled }: { galleryId: string; sections: GallerySection[]; favoritesEnabled: boolean; downloadsEnabled: boolean }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [slideIndex, setSlideIndex] = useState(0);

  const allMedia = useMemo(() => sections.flatMap((section) => section.media), [sections]);
  const allIds = useMemo(() => allMedia.map((item) => item.id), [allMedia]);
  const activeSlide = allMedia.at(slideIndex) ?? null;

  function changeView(mode: ViewMode) {
    setViewMode(mode);
    if (mode === "slideshow") setSlideIndex((index) => Math.min(index, Math.max(0, allMedia.length - 1)));
    if (typeof window !== "undefined") window.localStorage.setItem("rawi_gallery_view", mode);
  }

  function toggleSelected(mediaId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(mediaId)) next.delete(mediaId); else next.add(mediaId);
      return next;
    });
    setMessage(null);
  }

  function clearSelection() { setSelected(new Set()); setMessage(null); }
  function selectAll() { setSelected(new Set(allIds.slice(0, 100))); setMessage(allIds.length > 100 ? "Up to 100 files can be downloaded at once." : null); }

  async function downloadSelected() {
    if (selected.size === 0 || downloading) return;
    setDownloading(true); setProgress(10); setMessage("Preparing secure download links…");
    try {
      const result = await getBulkDownloadUrls(galleryId, Array.from(selected));
      if ("error" in result) { setMessage(result.error ?? "Couldn't prepare the selected files."); return; }
      const files = result.files ?? [];
      if (files.length === 0) { setMessage("No files were available to download."); return; }
      setProgress(55); setMessage(`Starting ${files.length} download${files.length === 1 ? "" : "s"}…`);
      files.forEach((file, index) => {
        window.setTimeout(() => {
          const link = document.createElement("a");
          link.href = file.url; link.download = file.name || "download"; link.rel = "noopener";
          document.body.appendChild(link); link.click(); link.remove();
          setProgress(Math.round(55 + ((index + 1) / files.length) * 45));
        }, index * 60);
      });
      window.setTimeout(() => { setMessage(`${files.length} file${files.length === 1 ? "" : "s"} sent to your downloads.`); setProgress(100); setSelected(new Set()); }, files.length * 60 + 250);
    } catch { setMessage("Something went wrong while preparing the download."); }
    finally { window.setTimeout(() => setDownloading(false), 400); }
  }

  const renderTile = (item: MediaItem, mode: ViewMode = viewMode) => (
    <MediaTile
      key={`${mode}-${item.id}`}
      mediaId={item.id}
      galleryId={galleryId}
      mediaType={item.media_type}
      favoritesEnabled={favoritesEnabled}
      downloadsEnabled={downloadsEnabled}
      initiallyFavorited={false}
      selectable={downloadsEnabled}
      selected={selected.has(item.id)}
      onToggleSelect={() => toggleSelected(item.id)}
      displayMode={mode}
    />
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-extrabold tracking-[0.16em] text-white/35">VIEW</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {VIEW_OPTIONS.map((option) => (
              <button key={option.id} type="button" onClick={() => changeView(option.id)} className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition ${viewMode === option.id ? "border-rawi-yellow bg-rawi-yellow text-black" : "border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:text-white"}`}>
                <span className="mr-1.5">{option.icon}</span>{option.label}
              </button>
            ))}
          </div>
        </div>
        <span className="text-xs text-white/35">{allMedia.length} item{allMedia.length === 1 ? "" : "s"}</span>
      </div>

      {downloadsEnabled && (
        <div className="sticky top-3 z-30 mb-6 overflow-hidden rounded-2xl border border-white/10 bg-black/85 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{selected.size} selected</span>
              <button type="button" onClick={selectAll} disabled={downloading} className="text-xs text-white/60 hover:text-white disabled:opacity-40">Select all</button>
              {selected.size > 0 && <button type="button" onClick={clearSelection} disabled={downloading} className="text-xs text-white/60 hover:text-white disabled:opacity-40">Clear</button>}
            </div>
            <div className="flex items-center gap-3">
              {message && <span className="hidden md:inline text-xs text-white/50">{message}</span>}
              <button type="button" onClick={downloadSelected} disabled={selected.size === 0 || downloading} className="min-w-[150px] rounded-full bg-rawi-yellow px-4 py-2 text-xs font-extrabold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
                {downloading ? "Preparing…" : `Download selected${selected.size ? ` (${selected.size})` : ""}`}
              </button>
            </div>
          </div>
          {downloading && <div className="h-1 bg-white/10"><div className="h-full bg-rawi-yellow transition-all duration-200" style={{ width: `${progress}%` }} /></div>}
          {message && <div className="px-4 pb-3 text-xs text-white/50 md:hidden">{message}</div>}
        </div>
      )}

      {viewMode === "slideshow" ? (
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex items-center justify-between text-xs text-white/45">
            <span>{allMedia.length ? `${slideIndex + 1} / ${allMedia.length}` : "0 / 0"}</span>
            <span>Use Previous / Next to browse</span>
          </div>
          {activeSlide ? renderTile(activeSlide, "slideshow") : <div className="py-24 text-center text-white/40">No media to display.</div>}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button type="button" onClick={() => setSlideIndex((index) => allMedia.length ? (index - 1 + allMedia.length) % allMedia.length : 0)} disabled={allMedia.length < 2} className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white disabled:opacity-30">← Previous</button>
            <button type="button" onClick={() => setSlideIndex((index) => allMedia.length ? (index + 1) % allMedia.length : 0)} disabled={allMedia.length < 2} className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black disabled:opacity-30">Next →</button>
          </div>
        </div>
      ) : (
        sections.map((section, index) => {
          if (section.media.length === 0) return null;
          return (
            <div key={section.id} className="mb-12">
              <div className="flex gap-5 items-baseline mb-4">
                <span className="text-[11px] text-gray-500">{String(index + 1).padStart(2, "0")}</span>
                <h4 className="text-2xl">{section.title}</h4>
              </div>
              {viewMode === "grid" && <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">{section.media.map((item) => renderTile(item, "grid"))}</div>}
              {viewMode === "masonry" && <div className="columns-1 sm:columns-2 md:columns-3 gap-3 [&>*]:mb-3 [&>*]:break-inside-avoid">{section.media.map((item) => renderTile(item, "masonry"))}</div>}
              {viewMode === "large" && <div className="mx-auto flex max-w-4xl flex-col gap-6">{section.media.map((item) => renderTile(item, "large"))}</div>}
            </div>
          );
        })
      )}
    </div>
  );
}
