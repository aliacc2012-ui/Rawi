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
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`rounded-full px-4 py-2.5 text-sm font-extrabold disabled:opacity-60 ${
          published ? "bg-rawi-panel border border-white/[.10] text-black" : "bg-rawi-yellow text-black"
        }`}
      >
        {pending ? "…" : published ? "Unpublish" : "Publish"}
      </button>
    </div>
  );
}
