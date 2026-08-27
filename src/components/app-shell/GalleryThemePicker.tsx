"use client";

import { useState, useTransition } from "react";
import { updateGalleryTheme, type GalleryTheme } from "@/app/(app)/projects/[id]/theme-actions";

const THEMES: { id: GalleryTheme; name: string; description: string; preview: string }[] = [
  { id: "clean", name: "Clean", description: "Bright, minimal and photo-first.", preview: "bg-[#f6f5f2] border-black/10" },
  { id: "dark", name: "Dark", description: "Black cinematic delivery.", preview: "bg-[#0b0b0b] border-white/10" },
  { id: "editorial", name: "Editorial", description: "Warm, spacious magazine feel.", preview: "bg-[#eee9df] border-[#c9bfad]" },
];

export function GalleryThemePicker({ galleryId, initialTheme }: { galleryId: string; initialTheme: GalleryTheme }) {
  const [theme, setTheme] = useState<GalleryTheme>(initialTheme);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function choose(next: GalleryTheme) {
    if (next === theme || pending) return;
    const previous = theme;
    setTheme(next);
    setMessage("Saving…");
    startTransition(async () => {
      const result = await updateGalleryTheme(galleryId, next);
      if ("error" in result && result.error) {
        setTheme(previous);
        setMessage(result.error);
      } else {
        setMessage("Saved ✓");
      }
    });
  }

  return <div className="mt-5 rounded-[20px] border border-gray-200 bg-white p-5">
    <div>
      <h3 className="text-[19px] font-semibold">Gallery theme</h3>
      <p className="mt-1 text-xs text-gray-400">Choose how clients experience this gallery.</p>
    </div>
    <div className="mt-4 grid gap-2">
      {THEMES.map(option => <button key={option.id} type="button" onClick={() => choose(option.id)} disabled={pending} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${theme === option.id ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}>
        <span className={`h-12 w-16 shrink-0 rounded-lg border ${option.preview}`}>
          <span className={`mx-auto mt-2 block h-1.5 w-9 rounded-full ${option.id === "dark" ? "bg-white/60" : "bg-black/35"}`}/>
          <span className={`mx-auto mt-1.5 block h-5 w-11 rounded ${option.id === "dark" ? "bg-white/15" : "bg-black/10"}`}/>
        </span>
        <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{option.name}</span><span className="mt-0.5 block text-xs text-gray-400">{option.description}</span></span>
        <span className={`grid h-5 w-5 place-items-center rounded-full border text-[10px] ${theme === option.id ? "border-black bg-black text-white" : "border-gray-300"}`}>{theme === option.id ? "✓" : ""}</span>
      </button>)}
    </div>
    <div className={`mt-3 text-xs font-bold ${message.includes("✓") ? "text-emerald-600" : message === "Saving…" ? "text-gray-400" : "text-red-600"}`}>{message}</div>
  </div>;
}
