"use client";

import { useRef, useState } from "react";
import { createClient, SupabaseNotConfiguredError } from "@/lib/supabase/client";
import { recordMediaUpload } from "@/app/(app)/actions";

type UploadItem = {
  id: string;
  name: string;
  status: "uploading" | "done" | "error";
  message?: string;
};

function mediaTypeFor(mime: string): "image" | "video" | "raw" {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "raw";
}

export function MediaUploader({ workspaceId, projectId }: { workspaceId: string; projectId: string }) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [notConfigured, setNotConfigured] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    let supabase;
    try {
      supabase = createClient();
    } catch (err) {
      if (err instanceof SupabaseNotConfiguredError) setNotConfigured(true);
      return;
    }

    for (const file of Array.from(files)) {
      const id = crypto.randomUUID();
      setItems((prev) => [...prev, { id, name: file.name, status: "uploading" }]);

      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `${workspaceId}/${projectId}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (uploadError) {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "error", message: uploadError.message } : i)));
        continue;
      }

      const result = await recordMediaUpload({
        projectId,
        fileName: safeName,
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
        storagePath: path,
        mediaType: mediaTypeFor(file.type || ""),
      });

      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? "error" in result
              ? { ...i, status: "error", message: result.error }
              : { ...i, status: "done" }
            : i
        )
      );
    }
  }

  if (notConfigured) {
    return (
      <div className="mt-4 border border-dashed border-gray-300 rounded-2xl p-6 text-center text-sm text-gray-500">
        Storage isn&rsquo;t configured yet. Uploads will work once Supabase credentials are set for this deployment.
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div
        className="border border-dashed border-gray-300 rounded-2xl p-6 text-center flex flex-col items-center gap-2"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          uploadFiles(e.dataTransfer.files);
        }}
      >
        <strong className="text-sm">Drop files here</strong>
        <span className="text-xs text-gray-400">Photos • Video • RAW</span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="border border-gray-300 rounded-full px-4 py-2 text-sm mt-2"
        >
          Select files
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => uploadFiles(e.target.files)}
        />
      </div>

      {items.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
              <span className="truncate">{item.name}</span>
              <span
                className={
                  item.status === "done" ? "text-green-700" : item.status === "error" ? "text-red-600" : "text-gray-400"
                }
              >
                {item.status === "uploading" ? "Uploading…" : item.status === "done" ? "Uploaded" : item.message || "Failed"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
