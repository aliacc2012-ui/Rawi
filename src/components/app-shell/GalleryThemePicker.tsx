"use client";

import { useState, useTransition } from "react";
import { updateGalleryTheme, type GalleryTheme } from "@/app/(app)/projects/[id]/theme-actions";

const THEMES: {
  id: GalleryTheme;
  name: string;
  description: string;
  bg: string;
  bar1: string;
  bar2: string;
  border: string;
  selectedBorder: string;
}[] = [
  {
    id: "clean",
    name: "Clean",
    description: "Bright, minimal and photo-first.",
    bg: "bg-[#f6f5f2]",
    bar1: "bg-black/30",
    bar2: "bg-black/10",
    border: "border-black/10",
    selectedBorder: "border-white/60",
  },
  {
    id: "dark",
    name: "Dark",
    description: "Black cinematic delivery.",
    bg: "bg-[#0b0b0b]",
    bar1: "bg-white/20",
    bar2: "bg-white/8",
    border: "border-white/10",
    selectedBorder: "border-white/60",
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Warm, spacious magazine feel.",
    bg: "bg-[#eee9df]",
    bar1: "bg-[#7a6e5f]/50",
    bar2: "bg-[#7a6e5f]/20",
    border: "border-[#c9bfad]",
    selectedBorder: "border-white/60",
  },
  {
    id: "noir",
    name: "Noir",
    description: "Deep charcoal, silver light.",
    bg: "bg-[#1a1a1e]",
    bar1: "bg-[#b0b0c0]/40",
    bar2: "bg-[#b0b0c0]/12",
    border: "border-[#3a3a44]",
    selectedBorder: "border-white/60",
  },
  {
    id: "blush",
    name: "Blush",
    description: "Soft pink, romantic warmth.",
    bg: "bg-[#f9eff0]",
    bar1: "bg-[#c97a8a]/50",
    bar2: "bg-[#c97a8a]/18",
    border: "border-[#e8c4cb]",
    selectedBorder: "border-white/60",
  },
  {
    id: "forest",
    name: "Forest",
    description: "Deep green, botanical calm.",
    bg: "bg-[#1b2a22]",
    bar1: "bg-[#6abf7a]/40",
    bar2: "bg-[#6abf7a]/12",
    border: "border-[#2d4535]",
    selectedBorder: "border-white/60",
  },
  {
    id: "slate",
    name: "Slate",
    description: "Cool blue-gray precision.",
    bg: "bg-[#e8ecf0]",
    bar1: "bg-[#3d5a72]/50",
    bar2: "bg-[#3d5a72]/15",
    border: "border-[#bac8d4]",
    selectedBorder: "border-white/60",
  },
  {
    id: "ivory",
    name: "Ivory",
    description: "Cream luxury, serif elegance.",
    bg: "bg-[#faf7f0]",
    bar1: "bg-[#8b7355]/45",
    bar2: "bg-[#8b7355]/15",
    border: "border-[#d4c8b0]",
    selectedBorder: "border-white/60",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep navy, celestial drama.",
    bg: "bg-[#0a0e1a]",
    bar1: "bg-[#6070c0]/45",
    bar2: "bg-[#6070c0]/12",
    border: "border-[#1a2040]",
    selectedBorder: "border-white/60",
  },
  {
    id: "ember",
    name: "Ember",
    description: "Warm amber, sunset tones.",
    bg: "bg-[#1c1208]",
    bar1: "bg-[#f09030]/50",
    bar2: "bg-[#f09030]/15",
    border: "border-[#3a2010]",
    selectedBorder: "border-white/60",
  },
];

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
        <h3 className="text-[19px] font-semibold">Gallery theme</h3>
        <p className="mt-1 text-xs text-white/45">Choose how clients experience this gallery.</p>
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
              {/* Mini preview */}
              <span
                className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border ${option.bg} ${option.border}`}
              >
                <span className={`mx-auto mt-2 block h-1.5 w-9 rounded-full ${option.bar1}`} />
                <span className={`mx-auto mt-1.5 block h-5 w-11 rounded ${option.bar2}`} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{option.name}</span>
                <span className="mt-0.5 block text-xs text-white/45">{option.description}</span>
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
          message.includes("✓")
            ? "text-emerald-400"
            : message === "Saving…"
            ? "text-white/45"
            : "text-red-500"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
