"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { publishGallery } from "@/app/(app)/actions";
import { trackEvent } from "@/lib/analytics";

export function PublishButton({ galleryId, isPublished }: { galleryId: string; isPublished: boolean }) {
  const router = useRouter();
  const [published, setPublished] = useState(isPublished);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    setError(null);
    const nextPublished = !published;
    startTransition(async () => {
      const result = await publishGallery(galleryId, nextPublished);
      if (result && "error" in result) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setPublished(nextPublished);
      if (nextPublished) trackEvent("gallery_published");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-3">
      {error && <span className="text-xs text-red-500">{error}</span>}

      {published ? (
        <div className="flex items-center gap-2.5">
          {/* Live indicator */}
          <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Live
          </span>
          {/* Unpublish button */}
          <button
            type="button"
            onClick={toggle}
            disabled={pending}
            className="rounded-full border border-white/[.12] bg-white/[.05] px-4 py-2 text-sm font-bold text-white/70 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
          >
            {pending ? "…" : "Unpublish"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          className="rounded-full bg-rawi-yellow px-5 py-2.5 text-sm font-extrabold text-black transition hover:bg-yellow-300 disabled:opacity-60"
        >
          {pending ? "…" : "Publish"}
        </button>
      )}
    </div>
  );
}
