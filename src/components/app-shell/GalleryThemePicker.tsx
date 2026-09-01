"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { updateGalleryTheme, type GalleryTheme } from "@/app/(app)/projects/[id]/theme-actions";

type LayoutType = "overlay" | "split" | "stack" | "minimal";

const THEMES: { id: GalleryTheme; name: string; description: string; layout: LayoutType; bg: string; imageBg: string }[] = [
  { id: "clean",     name: "Clean",     description: "Left overlay · 3-col grid",           layout: "overlay", bg: "bg-[#f6f5f2]", imageBg: "bg-[#c8c4bc]" },
  { id: "dark",      name: "Dark",      description: "Left overlay · tight grid",            layout: "overlay", bg: "bg-[#0b0b0b]", imageBg: "bg-[#2a2a2a]" },
  { id: "editorial", name: "Editorial", description: "Centered serif · masonry",             layout: "overlay", bg: "bg-[#eee9df]", imageBg: "bg-[#a09080]" },
  { id: "noir",      name: "Noir",      description: "Split: text left, photo right · 4-col",layout: "split",   bg: "bg-[#1a1a1e]", imageBg: "bg-[#3a3a44]" },
  { id: "blush",     name: "Blush",     description: "Centered serif · 2-col wide",          layout: "overlay", bg: "bg-[#f9eff0]", imageBg: "bg-[#d4a0a8]" },
  { id: "forest",    name: "Forest",    description: "Left overlay · masonry",               layout: "overlay", bg: "bg-[#1b2a22]", imageBg: "bg-[#2d4535]" },
  { id: "slate",     name: "Slate",     description: "Stack: image then text · 3-col",       layout: "stack",   bg: "bg-[#e8ecf0]", imageBg: "bg-[#6a8aa0]" },
  { id: "ivory",     name: "Ivory",     description: "No hero image · large photos",         layout: "minimal", bg: "bg-[#faf7f0]", imageBg: "bg-[#d4c8b0]" },
  { id: "midnight",  name: "Midnight",  description: "Text at bottom · 4-col dense",         layout: "overlay", bg: "bg-[#0a0e1a]", imageBg: "bg-[#1a2040]" },
  { id: "ember",     name: "Ember",     description: "Split: photo left, text right · 2-col",layout: "split",   bg: "bg-[#1c1208]", imageBg: "bg-[#3a2010]" },
];

const LAYOUT_COLOR: Record<LayoutType, string> = {
  overlay: "bg-white/8 text-white/40",
  split:   "bg-violet-500/15 text-violet-400",
  stack:   "bg-sky-500/15 text-sky-400",
  minimal: "bg-amber-500/15 text-amber-400",
};

function ThumbSwatch({ theme }: { theme: typeof THEMES[0] }) {
  return (
    <span className={`relative flex h-8 w-12 shrink-0 overflow-hidden rounded-lg ${theme.bg}`}>
      <span className={`absolute inset-0 opacity-60 ${theme.imageBg}`} />
      <span className="absolute bottom-1.5 left-1.5 right-1.5 space-y-0.5">
        <span className="block h-0.5 w-4 rounded-full bg-white/70" />
        <span className="block h-1 w-7 rounded-full bg-white/90" />
      </span>
    </span>
  );
}

export function GalleryThemePicker({ galleryId, initialTheme }: { galleryId: string; initialTheme: GalleryTheme }) {
  const [theme, setTheme] = useState<GalleryTheme>(initialTheme);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function choose(next: GalleryTheme) {
    if (next === theme || pending) return;
    const previous = theme;
    setTheme(next);
    setOpen(false);
    setMessage("Saving…");
    startTransition(async () => {
      const result = await updateGalleryTheme(galleryId, next);
      if ("error" in result && result.error) { setTheme(previous); setMessage(result.error); }
      else setMessage("Saved ✓");
    });
  }

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <div className="mt-5 rounded-[20px] border border-white/[.07] bg-rawi-panel p-5">
      <h3 className="font-cormorant text-[22px] italic font-light text-white leading-tight">Gallery theme</h3>
      <p className="mt-1 text-xs text-white/40">Choose a layout for how clients experience this gallery.</p>

      <div ref={ref} className="relative mt-4">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          disabled={pending}
          className="flex w-full items-center gap-3 rounded-xl border border-white/[.10] bg-white/[.04] px-3 py-2.5 text-left transition hover:border-white/[.18] hover:bg-white/[.06] disabled:opacity-60"
        >
          <ThumbSwatch theme={current} />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-white">{current.name}</span>
            <span className="block text-[11px] text-white/40">{current.description}</span>
          </span>
          <span className={`text-[9px] font-extrabold tracking-widest uppercase rounded px-1.5 py-0.5 ${LAYOUT_COLOR[current.layout]}`}>
            {current.layout}
          </span>
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            className={`shrink-0 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-white/[.10] bg-[#141414] shadow-2xl">
            {THEMES.map((option) => {
              const active = theme === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => choose(option.id)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${
                    active ? "bg-rawi-yellow/8" : "hover:bg-white/[.04]"
                  }`}
                >
                  <ThumbSwatch theme={option} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-white">{option.name}</span>
                    <span className="block text-[11px] text-white/40">{option.description}</span>
                  </span>
                  <span className={`text-[9px] font-extrabold tracking-widest uppercase rounded px-1.5 py-0.5 ${LAYOUT_COLOR[option.layout]}`}>
                    {option.layout}
                  </span>
                  {active && (
                    <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-rawi-yellow text-[9px] font-black text-black">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className={`mt-2 text-xs font-bold ${message.includes("✓") ? "text-emerald-400" : message === "Saving…" ? "text-white/45" : "text-red-500"}`}>
        {message}
      </div>
    </div>
  );
}
