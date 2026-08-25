"use client";

import { useEffect, useState } from "react";
import { getSignedMediaUrl, toggleFavorite } from "@/app/g/[slug]/actions";

export function MediaTile({
  mediaId,
  galleryId,
  mediaType,
  favoritesEnabled,
  downloadsEnabled,
  initiallyFavorited,
}: {
  mediaId: string;
  galleryId: string;
  mediaType: "image" | "video" | "raw";
  favoritesEnabled: boolean;
  downloadsEnabled: boolean;
  initiallyFavorited: boolean;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(initiallyFavorited);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSignedMediaUrl(mediaId, false).then((res) => {
      if (cancelled) return;
      if ("url" in res && res.url) setUrl(res.url);
      else setError(("error" in res && res.error) || "Couldn't load this file.");
    });
    return () => {
      cancelled = true;
    };
  }, [mediaId]);

  async function handleFavorite() {
    const result = await toggleFavorite(galleryId, mediaId, favorited);
    if ("error" in result) return;
    setFavorited(Boolean(result.favorited));
  }

  async function handleDownload() {
    const result = await getSignedMediaUrl(mediaId, true);
    if ("error" in result) {
      setError(result.error ?? null);
      return;
    }
    window.location.href = result.url!;
  }

  return (
    <div className="relative rounded-xl overflow-hidden bg-[#111] aspect-[4/3] group">
      {url ? (
        mediaType === "video" ? (
          <video src={url} controls className="w-full h-full object-cover" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" loading="lazy" className="w-full h-full object-cover" />
        )
      ) : error ? (
        <div className="w-full h-full grid place-items-center text-xs text-gray-500 p-2 text-center">{error}</div>
      ) : (
        <div className="w-full h-full animate-pulse bg-[#1a1a1a]" />
      )}

      <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {favoritesEnabled && (
          <button
            type="button"
            onClick={handleFavorite}
            aria-label={favorited ? "Remove favorite" : "Favorite"}
            className={`w-8 h-8 rounded-full grid place-items-center text-sm backdrop-blur ${
              favorited ? "bg-rawi-yellow text-black" : "bg-black/50 text-white"
            }`}
          >
            {favorited ? "♥" : "♡"}
          </button>
        )}
        {downloadsEnabled && (
          <button
            type="button"
            onClick={handleDownload}
            aria-label="Download"
            className="w-8 h-8 rounded-full grid place-items-center text-sm bg-black/50 text-white backdrop-blur"
          >
            ↓
          </button>
        )}
      </div>
    </div>
  );
}
