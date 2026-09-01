"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { setGalleryCoverImage } from "@/app/(app)/actions";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

export function BannerUploader({
  galleryId,
  workspaceId,
  projectId,
  initialPath,
}: {
  galleryId: string;
  workspaceId: string;
  projectId: string;
  initialPath?: string | null;
}) {
  const [path, setPath] = useState<string | null>(initialPath ?? null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError(null);
    if (!ACCEPTED.includes(file.type)) { setError("Only JPEG, PNG, WebP or AVIF accepted."); return; }
    if (file.size > MAX_BYTES) { setError("Image must be under 20 MB."); return; }

    // local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploading(true);
    setProgress(10);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const storagePath = `${workspaceId}/${projectId}/banner/cover-${Date.now()}.${ext}`;

      // Use standard upload (banner is small enough)
      const { error: upErr } = await supabase.storage
        .from("media")
        .upload(storagePath, file, { contentType: file.type, cacheControl: "31536000", upsert: true });
      if (upErr) { setError(upErr.message); setUploading(false); setPreviewUrl(null); return; }

      setProgress(80);

      startTransition(async () => {
        const result = await setGalleryCoverImage(galleryId, storagePath);
        if (result?.error) { setError(result.error); setPreviewUrl(null); }
        else setPath(storagePath);
        setUploading(false);
        setProgress(100);
        setTimeout(() => setProgress(0), 600);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
      setUploading(false);
      setPreviewUrl(null);
    }
  }

  function removeCover() {
    setError(null);
    setPreviewUrl(null);
    const prev = path;
    setPath(null);
    startTransition(async () => {
      const result = await setGalleryCoverImage(galleryId, null);
      if (result?.error) { setError(result.error); setPath(prev); }
    });
  }

  function onFiles(files: FileList | null) {
    if (files?.[0]) upload(files[0]);
  }

  const hasCover = path || previewUrl;

  return (
    <div className="mt-5 rounded-[20px] border border-white/[.07] bg-rawi-panel p-5">
      <h3 className="font-cormorant text-[22px] italic font-light text-white leading-tight">Gallery banner</h3>
      <p className="mt-1 text-xs text-white/40">Separate hero image shown at the top of your gallery.</p>

      <div className="mt-4">
        {hasCover ? (
          /* Preview */
          <div className="group relative overflow-hidden rounded-2xl">
            <img
              src={previewUrl ?? `/api/banner-preview?path=${encodeURIComponent(path ?? "")}`}
              alt="Gallery banner"
              className="h-36 w-full rounded-2xl object-cover"
            />
            {/* overlay actions */}
            <div className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading || pending}
                className="rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur hover:bg-white/25"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={removeCover}
                disabled={uploading || pending}
                className="rounded-xl bg-red-600/80 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500"
              >
                Remove
              </button>
            </div>
            {(uploading || pending) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                <svg className="h-6 w-6 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              </div>
            )}
          </div>
        ) : (
          /* Drop zone */
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); onFiles(e.dataTransfer.files); }}
            disabled={uploading || pending}
            className={`flex h-36 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition ${
              dragging
                ? "border-rawi-yellow/60 bg-rawi-yellow/5"
                : "border-white/[.10] hover:border-white/[.20] hover:bg-white/[.02]"
            }`}
          >
            {uploading ? (
              <>
                <svg className="h-6 w-6 animate-spin text-white/60" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                <span className="text-xs text-white/45">Uploading…</span>
              </>
            ) : (
              <>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white/30">
                  <path d="M4 16l4-4 4 4 4-8 4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span className="text-xs text-white/45">Click or drag an image here</span>
                <span className="text-[10px] text-white/25">JPEG · PNG · WebP · up to 20 MB</span>
              </>
            )}
          </button>
        )}

        {/* Progress bar */}
        {uploading && progress > 0 && (
          <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-rawi-yellow transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />
    </div>
  );
}
