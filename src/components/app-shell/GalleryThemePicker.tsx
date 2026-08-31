"use client";

import { useState, useTransition } from "react";
import { updateGalleryTheme, type GalleryTheme } from "@/app/(app)/projects/[id]/theme-actions";

type LayoutType = "overlay" | "split" | "stack" | "minimal";

const THEMES: {
  id: GalleryTheme;
  name: string;
  description: string;
  layout: LayoutType;
  bg: string;
  imageBg: string;
  textColor: string;
}[] = [
  {
    id: "clean",
    name: "Clean",
    description: "Left overlay · 3-col grid",
    layout: "overlay",
    bg: "bg-[#f6f5f2]",
    imageBg: "bg-[#c8c4bc]",
    textColor: "text-[#111]",
  },
  {
    id: "dark",
    name: "Dark",
    description: "Left overlay · tight grid",
    layout: "overlay",
    bg: "bg-[#0b0b0b]",
    imageBg: "bg-[#2a2a2a]",
    textColor: "text-white",
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Centered serif · masonry",
    layout: "overlay",
    bg: "bg-[#eee9df]",
    imageBg: "bg-[#a09080]",
    textColor: "text-[#201d19]",
  },
  {
    id: "noir",
    name: "Noir",
    description: "Split: text left, photo right · 4-col",
    layout: "split",
    bg: "bg-[#1a1a1e]",
    imageBg: "bg-[#3a3a44]",
    textColor: "text-[#dddde8]",
  },
  {
    id: "blush",
    name: "Blush",
    description: "Centered serif · 2-col wide",
    layout: "overlay",
    bg: "bg-[#f9eff0]",
    imageBg: "bg-[#d4a0a8]",
    textColor: "text-[#3a1e25]",
  },
  {
    id: "forest",
    name: "Forest",
    description: "Left overlay · masonry",
    layout: "overlay",
    bg: "bg-[#1b2a22]",
    imageBg: "bg-[#2d4535]",
    textColor: "text-[#c8ddc8]",
  },
  {
    id: "slate",
    name: "Slate",
    description: "Stack: image then text · 3-col",
    layout: "stack",
    bg: "bg-[#e8ecf0]",
    imageBg: "bg-[#6a8aa0]",
    textColor: "text-[#1e2a36]",
  },
  {
    id: "ivory",
    name: "Ivory",
    description: "No hero image · large photos",
    layout: "minimal",
    bg: "bg-[#faf7f0]",
    imageBg: "bg-[#d4c8b0]",
    textColor: "text-[#2e2820]",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Text at bottom · 4-col dense",
    layout: "overlay",
    bg: "bg-[#0a0e1a]",
    imageBg: "bg-[#1a2040]",
    textColor: "text-[#c8cce8]",
  },
  {
    id: "ember",
    name: "Ember",
    description: "Split: photo left, text right · 2-col",
    layout: "split",
    bg: "bg-[#1c1208]",
    imageBg: "bg-[#3a2010]",
    textColor: "text-[#e8d0a8]",
  },
];

// Tiny SVG icons representing each layout type
function LayoutIcon({ layout, imageBg }: { layout: LayoutType; imageBg: string }) {
  if (layout === "overlay") {
    // Full-bleed image with text bars overlaid bottom-left
    return (
      <span className={`relative block h-12 w-16 overflow-hidden rounded-lg ${imageBg}`}>
        <span className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/20 to-transparent" />
        <span className="absolute bottom-2 left-2 right-2 space-y-1">
          <span className="block h-1 w-6 rounded-full bg-white/70" />
          <span className="block h-1.5 w-10 rounded-full bg-white/90" />
        </span>
      </span>
    );
  }
  if (layout === "split") {
    // Half text panel, half image side by side
    return (
      <span className="relative flex h-12 w-16 overflow-hidden rounded-lg">
        {/* Text side */}
        <span className="relative flex w-[45%] flex-col justify-end p-1.5 bg-[#0e0e14]">
          <span className="block h-0.5 w-4 rounded-full bg-white/40 mb-0.5" />
          <span className="block h-1 w-6 rounded-full bg-white/70" />
        </span>
        {/* Image side */}
        <span className={`flex-1 ${imageBg}`} />
        {/* Divider */}
        <span className="absolute left-[45%] inset-y-0 w-px bg-white/10" />
      </span>
    );
  }
  if (layout === "stack") {
    // Image strip on top, text below
    return (
      <span className="flex flex-col h-12 w-16 overflow-hidden rounded-lg">
        <span className={`h-[55%] w-full ${imageBg}`} />
        <span className="flex-1 bg-[#e8ecf0] flex flex-col justify-center px-1.5 gap-0.5">
          <span className="block h-0.5 w-4 rounded-full bg-[#1e2a36]/30" />
          <span className="block h-1 w-8 rounded-full bg-[#1e2a36]/60" />
        </span>
      </span>
    );
  }
  // minimal — centered text lines, no image
  return (
    <span className="flex flex-col items-center justify-center h-12 w-16 overflow-hidden rounded-lg bg-[#faf7f0] gap-1 border border-amber-200/40">
      <span className="block h-0.5 w-5 rounded-full bg-[#c8a860]/60" />
      <span className="block h-1.5 w-10 rounded-full bg-[#2e2820]/50" />
      <span className="block h-1 w-8 rounded-full bg-[#2e2820]/25" />
    </span>
  );
}

const LAYOUT_LABEL: Record<LayoutType, string> = {
  overlay: "Overlay",
  split:   "Split",
  stack:   "Stack",
  minimal: "Minimal",
};

export function GalleryThemePicker({
  galleryId,
  initialTheme,
}: {
  galleryId: string;
  initialTheme: GalleryTheme;
}) {
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

  return (
    <div className="mt-5 rounded-[20px] border border-white/[.07] bg-rawi-panel p-5">
      <div>
        <h3 className="font-cormorant text-[22px] italic font-light text-white leading-tight">Gallery theme</h3>
        <p className="mt-1 text-xs text-white/40">Choose a layout for how clients experience this gallery.</p>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {THEMES.map((option) => {
          const active = theme === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => choose(option.id)}
              disabled={pending}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                active
                  ? "border-rawi-yellow/60 bg-rawi-yellow/5 ring-1 ring-rawi-yellow/20"
                  : "border-white/[.07] hover:border-white/[.14] hover:bg-white/[.02]"
              }`}
            >
              {/* Layout preview */}
              <LayoutIcon layout={option.layout} imageBg={option.imageBg} />

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="block text-sm font-bold">{option.name}</span>
                  <span className={`text-[9px] font-extrabold tracking-widest uppercase rounded px-1.5 py-0.5 ${
                    option.layout === "split"   ? "bg-violet-500/15 text-violet-400" :
                    option.layout === "stack"   ? "bg-sky-500/15 text-sky-400" :
                    option.layout === "minimal" ? "bg-amber-500/15 text-amber-400" :
                    "bg-white/8 text-white/40"
                  }`}>{LAYOUT_LABEL[option.layout]}</span>
                </span>
                <span className="mt-0.5 block text-[11px] text-white/40">{option.description}</span>
              </span>

              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] transition ${
                  active
                    ? "border-rawi-yellow bg-rawi-yellow text-black"
                    : "border-white/[.10]"
                }`}
              >
                {active ? "✓" : ""}
              </span>
            </button>
          );
        })}
      </div>
      <div
        className={`mt-3 text-xs font-bold ${
          message.includes("✓") ? "text-emerald-400"
          : message === "Saving…" ? "text-white/45"
          : "text-red-500"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
