"use client";

import { useMemo, useState } from "react";
import { getBulkDownloadUrls } from "@/app/g/[slug]/actions";
import { MediaTile } from "@/components/gallery/MediaTile";

type MediaItem = {
  id: string;
  media_type: "image" | "video" | "raw";
};

type GallerySection = {
  id: string;
  title: string;
  media: MediaItem[];
};

export function GalleryMediaGrid({
  galleryId,
  sections,
  favoritesEnabled,
  downloadsEnabled,
}: {
  galleryId: string;
  sections: GallerySection[];
  favoritesEnabled: boolean;
  downloadsEnabled: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const allIds = useMemo(() => sections.flatMap((section) => section.media.map((item) => item.id)), [sections]);

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
      const ids = Array.from(selected);
      const result = await getBulkDownloadUrls(galleryId, ids);

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

  return (
    <div>
      {downloadsEnabled && (
        <div className="sticky top-3 z-30 mb-6 overflow-hidden rounded-2xl border border-white/10 bg-black/85 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{selected.size} selected</span>
              <button type="button" onClick={selectAll} disabled={downloading} className="text-xs text-white/60 hover:text-white disabled:opacity-40">Select all</button>
              {selected.size > 0 && (
                <button type="button" onClick={clearSelection} disabled={downloading} className="text-xs text-white/60 hover:text-white disabled:opacity-40">Clear</button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {message && <span className="hidden md:inline text-xs text-white/50">{message}</span>}
              <button
                type="button"
                onClick={downloadSelected}
                disabled={selected.size === 0 || downloading}
                className="min-w-[150px] rounded-full bg-rawi-yellow px-4 py-2 text-xs font-extrabold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {downloading ? "Preparing…" : `Download selected${selected.size ? ` (${selected.size})` : ""}`}
              </button>
            </div>
          </div>
          {downloading && (
            <div className="h-1 bg-white/10">
              <div className="h-full bg-rawi-yellow transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
          )}
          {message && <div className="px-4 pb-3 text-xs text-white/50 md:hidden">{message}</div>}
        </div>
      )}

      {sections.map((section, index) => {
        if (section.media.length === 0) return null;
        return (
          <div key={section.id} className="mb-12">
            <div className="flex gap-5 items-baseline mb-4">
              <span className="text-[11px] text-gray-500">{String(index + 1).padStart(2, "0")}</span>
              <h4 className="text-2xl">{section.title}</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {section.media.map((item) => (
                <MediaTile
                  key={item.id}
                  mediaId={item.id}
                  galleryId={galleryId}
                  mediaType={item.media_type}
                  favoritesEnabled={favoritesEnabled}
                  downloadsEnabled={downloadsEnabled}
                  initiallyFavorited={false}
                  selectable={downloadsEnabled}
                  selected={selected.has(item.id)}
                  onToggleSelect={() => toggleSelected(item.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
