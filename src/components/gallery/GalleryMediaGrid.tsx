"use client";

import { useMemo, useState } from "react";
import { getSignedMediaUrl } from "@/app/g/[slug]/actions";
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
  const [message, setMessage] = useState<string | null>(null);

  const allIds = useMemo(() => sections.flatMap((section) => section.media.map((item) => item.id)), [sections]);

  function toggleSelected(mediaId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(mediaId)) next.delete(mediaId);
      else next.add(mediaId);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function selectAll() {
    setSelected(new Set(allIds));
  }

  async function downloadSelected() {
    if (selected.size === 0 || downloading) return;
    setDownloading(true);
    setMessage(null);

    const ids = Array.from(selected);
    let completed = 0;

    for (const mediaId of ids) {
      const result = await getSignedMediaUrl(mediaId, true);
      if ("url" in result && result.url) {
        const link = document.createElement("a");
        link.href = result.url;
        link.download = "";
        link.target = "_blank";
        link.rel = "noopener";
        document.body.appendChild(link);
        link.click();
        link.remove();
        completed += 1;
        await new Promise((resolve) => setTimeout(resolve, 180));
      }
    }

    setDownloading(false);
    setMessage(completed === ids.length ? `${completed} files started downloading.` : `${completed} of ${ids.length} files started downloading.`);
  }

  return (
    <div>
      {downloadsEnabled && (
        <div className="sticky top-3 z-30 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/80 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">{selected.size} selected</span>
            <button type="button" onClick={selectAll} className="text-xs text-white/60 hover:text-white">Select all</button>
            {selected.size > 0 && (
              <button type="button" onClick={clearSelection} className="text-xs text-white/60 hover:text-white">Clear</button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {message && <span className="hidden sm:inline text-xs text-white/50">{message}</span>}
            <button
              type="button"
              onClick={downloadSelected}
              disabled={selected.size === 0 || downloading}
              className="rounded-full bg-rawi-yellow px-4 py-2 text-xs font-extrabold text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              {downloading ? "Preparing…" : `Download selected${selected.size ? ` (${selected.size})` : ""}`}
            </button>
          </div>
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
