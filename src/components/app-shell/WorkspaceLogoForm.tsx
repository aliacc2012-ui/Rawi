"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { updateWorkspaceLogo } from "@/app/(app)/actions";
import { createClient } from "@/lib/supabase/client";

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const LOGO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function WorkspaceLogoForm({
  workspaceId,
  initialLogoUrl,
}: {
  workspaceId: string;
  initialLogoUrl: string;
}) {
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function upload(file?: File) {
    if (!file) return;
    if (!LOGO_TYPES.has(file.type) || file.size > MAX_LOGO_BYTES) {
      setMessage("Use a JPG, PNG or WebP logo up to 2 MB.");
      return;
    }
    setMessage("");
    startTransition(async () => {
      const supabase = createClient();
      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${workspaceId}/branding/logo-${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("public-assets")
        .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
      if (uploadError) {
        setMessage(uploadError.message);
        return;
      }
      const { data } = supabase.storage.from("public-assets").getPublicUrl(path);
      const result = await updateWorkspaceLogo(workspaceId, data.publicUrl);
      if ("error" in result) {
        await supabase.storage.from("public-assets").remove([path]);
        setMessage(result.error ?? "Couldn't save the studio logo.");
        return;
      }
      setLogoUrl(data.publicUrl);
      setMessage("Logo saved ✓");
    });
  }

  function remove() {
    setMessage("");
    startTransition(async () => {
      const result = await updateWorkspaceLogo(workspaceId, null);
      if ("error" in result) {
        setMessage(result.error ?? "Couldn't remove the studio logo.");
        return;
      }
      setLogoUrl("");
      if (inputRef.current) inputRef.current.value = "";
      setMessage("Logo removed ✓");
    });
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/[.07] bg-rawi-panel/[.04]">
        {logoUrl ? (
          <Image src={logoUrl} alt="Studio logo" width={80} height={80} className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl font-black text-white/60">R</span>
        )}
      </div>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => upload(event.target.files?.[0])}
          className="block max-w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-black file:px-4 file:py-2.5 file:font-bold file:text-white"
        />
        <div className="mt-3 flex items-center gap-3">
          {logoUrl && (
            <button type="button" onClick={remove} disabled={pending} className="text-xs font-bold text-white/40 underline">
              Remove logo
            </button>
          )}
          {message && <span className={`text-xs font-bold ${message.includes("✓") ? "text-emerald-600" : "text-red-600"}`}>{message}</span>}
        </div>
        <p className="mt-2 text-[11px] text-white/45">Square JPG, PNG or WebP · maximum 2 MB.</p>
      </div>
    </div>
  );
}
