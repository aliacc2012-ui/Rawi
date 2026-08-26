"use client";

import { useMemo, useState } from "react";
import { getBulkDownloadUrls } from "@/app/g/[slug]/actions";
import { MediaTile } from "@/components/gallery/MediaTile";

type ViewMode = "grid" | "masonry" | "large" | "slideshow";
type MediaItem = { id: string; media_type: "image" | "video" | "raw" };
type GallerySection = { id: string; title: string; media: MediaItem[] };
type Theme = "dark" | "light";

const VIEW_OPTIONS: { id: ViewMode; label: string; icon: string }[] = [
  { id: "grid", label: "Grid", icon: "▦" },
  { id: "masonry", label: "Masonry", icon: "▥" },
  { id: "large", label: "Large", icon: "▭" },
  { id: "slideshow", label: "Slideshow", icon: "▶" },
];

export function GalleryMediaGrid({
  galleryId,
  sections,
  favoritesEnabled,
  downloadsEnabled,
  theme = "dark",
}: {
  galleryId: string;
  sections: GallerySection[];
  favoritesEnabled: boolean;
  downloadsEnabled: boolean;
  theme?: Theme;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [slideIndex, setSlideIndex] = useState(0);

  const allMedia = useMemo(() => sections.flatMap((section) => section.media), [sections]);
  const allIds = useMemo(() => allMedia.map((item) => item.id), [allMedia]);
  const activeSlide = allMedia.at(slideIndex) ?? null;
  const light = theme === "light";

  function changeView(mode: ViewMode) {
    setViewMode(mode);
    if (mode === "slideshow") {
      setSlideIndex((index) => Math.min(index, Math.max(0, allMedia.length - 1)));
    }
    if (typeof window !== "undefined") window.localStorage.setItem("rawi_gallery_view", mode);
  }

  function toggleSelected(mediaId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(mediaId)) next.delete(mediaId);
      else next.add(mediaId);
      return next;
    });
    setMessage(null);
  }

  function clearSelection() {
    setSelected(new Set());
    setMessage(null);
  }

  function selectAll() {
    setSelected(new Set(allIds.slice(0, 100)));
    setMessage(allIds.length > 100 ? "Up to 100 files can be downloaded at once." : null);
  }

  async function downloadSelected() {
    if (selected.size === 0 || downloading) return;
    setDownloading(true);
    setProgress(10);
    setMessage("Preparing secure download links…");

    try {
      const result = await getBulkDownloadUrls(galleryId, Array.from(selected));
      if ("error" in result) {
        setMessage(result.error ?? "Couldn't prepare the selected files.");
        return;
      }

      const files = result.files ?? [];
      if (files.length === 0) {
        setMessage("No files were available to download.");
        return;
      }

      setProgress(55);
      setMessage(`Starting ${files.length} download${files.length === 1 ? "" : "s"}…`);

      files.forEach((file, index) => {
        window.setTimeout(() => {
          const link = document.createElement("a");
          link.href = file.url;
          link.download = file.name || "download";
          link.rel = "noopener";
          document.body.appendChild(link);
          link.click();
          link.remove();
          setProgress(Math.round(55 + ((index + 1) / files.length) * 45));
        }, index * 60);
      });

      window.setTimeout(() => {
        setMessage(`${files.length} file${files.length === 1 ? "" : "s"} sent to your downloads.`);
        setProgress(100);
        setSelected(new Set());
      }, files.length * 60 + 250);
    } catch {
      setMessage("Something went wrong while preparing the download.");
    } finally {
      window.setTimeout(() => setDownloading(false), 400);
    }
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

  const labelClass = light ? "text-black/35" : "text-white/35";
  const secondaryClass = light ? "text-black/45" : "text-white/45";
  const inactiveViewClass = light
    ? "border-black/10 bg-white text-black/60 hover:border-black/25 hover:text-black"
    : "border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:text-white";
  const sectionTitleClass = light ? "text-black" : "text-white";

  return (
    <div>
      <div className={`mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl ${light ? "border border-black/10 bg-white px-4 py-3" : ""}`}>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`text-[10px] font-extrabold tracking-[0.16em] ${labelClass}`}>VIEW</span>
          <div className="flex flex-wrap gap-2">
            {VIEW_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => changeView(option.id)}
                className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                  viewMode === option.id
                    ? "border-[#d6b600] bg-[#FFD400] text-black"
                    : inactiveViewClass
                }`}
              >
                <span className="mr-1.5">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <span className={`text-xs ${secondaryClass}`}>{allMedia.length} item{allMedia.length === 1 ? "" : "s"}</span>
      </div>

      {downloadsEnabled && (
        <div className={`sticky top-3 z-30 mb-7 overflow-hidden rounded-xl backdrop-blur-xl ${light ? "border border-black/10 bg-white/95 shadow-lg" : "border border-white/10 bg-black/85 shadow-2xl"}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold ${light ? "text-black" : "text-white"}`}>{selected.size} selected</span>
              <button type="button" onClick={selectAll} disabled={downloading} className={`text-xs disabled:opacity-40 ${light ? "text-black/45 hover:text-black" : "text-white/60 hover:text-white"}`}>Select all</button>
              {selected.size > 0 && (
                <button type="button" onClick={clearSelection} disabled={downloading} className={`text-xs disabled:opacity-40 ${light ? "text-black/45 hover:text-black" : "text-white/60 hover:text-white"}`}>Clear</button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {message && <span className={`hidden md:inline text-xs ${light ? "text-black/40" : "text-white/50"}`}>{message}</span>}
              <button
                type="button"
                onClick={downloadSelected}
                disabled={selected.size === 0 || downloading}
                className="min-w-[150px] rounded-full bg-[#FFD400] px-4 py-2 text-xs font-extrabold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {downloading ? "Preparing…" : `Download selected${selected.size ? ` (${selected.size})` : ""}`}
              </button>
            </div>
          </div>
          {downloading && (
            <div className={light ? "h-1 bg-black/5" : "h-1 bg-white/10"}>
              <div className="h-full bg-[#FFD400] transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
          )}
          {message && <div className={`px-4 pb-3 text-xs md:hidden ${light ? "text-black/40" : "text-white/50"}`}>{message}</div>}
        </div>
      )}

      {viewMode === "slideshow" ? (
        <div className="mx-auto max-w-5xl">
          <div className={`mb-3 flex items-center justify-between text-xs ${secondaryClass}`}>
            <span>{allMedia.length ? `${slideIndex + 1} / ${allMedia.length}` : "0 / 0"}</span>
            <span>Use Previous / Next to browse</span>
          </div>
          {activeSlide ? renderTile(activeSlide, "slideshow") : <div className={`py-24 text-center ${secondaryClass}`}>No media to display.</div>}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setSlideIndex((index) => allMedia.length ? (index - 1 + allMedia.length) % allMedia.length : 0)}
              disabled={allMedia.length < 2}
              className={`rounded-full border px-5 py-2.5 text-sm disabled:opacity-30 ${light ? "border-black/15 bg-white text-black" : "border-white/15 text-white"}`}
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={() => setSlideIndex((index) => allMedia.length ? (index + 1) % allMedia.length : 0)}
              disabled={allMedia.length < 2}
              className="rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        </div>
      ) : (
        sections.map((section, index) => {
          if (section.media.length === 0) return null;
          return (
            <div key={section.id} className="mb-14">
              <div className="mb-5 flex items-baseline gap-5">
                <span className={`text-[11px] ${secondaryClass}`}>{String(index + 1).padStart(2, "0")}</span>
                <h4 className={`text-2xl font-semibold tracking-[-0.03em] ${sectionTitleClass}`}>{section.title}</h4>
              </div>

              {viewMode === "grid" && <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{section.media.map((item) => renderTile(item, "grid"))}</div>}
              {viewMode === "masonry" && <div className="columns-1 gap-3 sm:columns-2 md:columns-3 [&>*]:mb-3 [&>*]:break-inside-avoid">{section.media.map((item) => renderTile(item, "masonry"))}</div>}
              {viewMode === "large" && <div className="mx-auto flex max-w-4xl flex-col gap-7">{section.media.map((item) => renderTile(item, "large"))}</div>}
            </div>
          );
        })
      )}
    </div>
  );
}
