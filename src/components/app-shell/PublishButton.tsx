"use client";

import { useState, useTransition } from "react";
import { publishGallery } from "@/app/(app)/actions";

export function PublishButton({ galleryId, isPublished }: { galleryId: string; isPublished: boolean }) {
  const [published, setPublished] = useState(isPublished);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    setError(null);
    startTransition(async () => {
      const result = await publishGallery(galleryId, !published);
      if (result && "error" in result) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setPublished(!published);
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
          published ? "bg-white border border-gray-300 text-black" : "bg-rawi-yellow text-black"
        }`}
      >
        {pending ? "…" : published ? "Unpublish" : "Publish"}
      </button>
    </div>
  );
}
