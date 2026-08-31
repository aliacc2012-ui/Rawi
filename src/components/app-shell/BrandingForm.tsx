"use client";

import { useState, useTransition } from "react";
import { updateBranding } from "@/app/(app)/actions";
import { Field, LegacyInput as Input, ErrorNote, SuccessNote } from "@/components/ui/form";

export function BrandingForm({
  workspaceId,
  initialName,
  initialAccent,
}: {
  workspaceId: string;
  initialName: string;
  initialAccent: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState(initialName);
  const [accent, setAccent] = useState(initialAccent);

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await updateBranding(workspaceId, formData);
      if (result && "error" in result) { setError(result.error ?? "Something went wrong."); return; }
      setSuccess(true);
    });
  }

  return (
    <div className="grid xl:grid-cols-[1fr_1.15fr] gap-5">
      {/* Left: form */}
      <div className="bg-rawi-panel border border-white/[.07] rounded-[22px] p-6 self-start">
        <h2 className="font-cormorant text-[28px] tracking-[-0.02em] text-[#F0EFFF]">Studio identity</h2>
        <p className="text-sm text-white/40 mt-1 mb-6">Update your public studio name and signature accent.</p>
        <form action={handleSubmit} className="space-y-5">
          <Field label="Studio name">
            <Input
              name="studioName"
              defaultValue={initialName}
              required
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value || "Your Studio")}
            />
          </Field>
          <div>
            <div className="text-sm font-semibold text-white/70 mb-3">Accent color</div>
            <div className="flex items-center gap-4">
              <label className="relative cursor-pointer group">
                <input
                  type="color"
                  name="accentColor"
                  defaultValue={initialAccent}
                  onChange={(e) => setAccent(e.target.value)}
                  className="sr-only"
                />
                <div
                  className="w-12 h-12 rounded-[14px] border-2 border-white/20 group-hover:border-white/40 transition-all shadow-lg"
                  style={{ backgroundColor: accent }}
                />
                <div className="absolute inset-0 rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white drop-shadow">PICK</span>
                </div>
              </label>
              <div>
                <div className="text-[11px] text-white/35 font-mono">{accent.toUpperCase()}</div>
                <div className="text-xs text-white/25 mt-0.5">Click swatch to change</div>
              </div>
            </div>
          </div>
          {error && <ErrorNote>{error}</ErrorNote>}
          {success && <SuccessNote>Branding updated.</SuccessNote>}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl px-5 py-3 text-sm font-extrabold text-black transition-all hover:opacity-90 active:scale-[.98] disabled:opacity-60"
            style={{ backgroundColor: accent }}
          >
            {pending ? "Saving…" : "Save branding"}
          </button>
        </form>
      </div>

      {/* Right: live preview */}
      <div className="xl:sticky xl:top-6 self-start">
        <div className="rounded-[22px] bg-rawi-panel border border-white/[.07] p-4">
          <div className="text-[10px] text-white/30 font-semibold tracking-widest mb-3 px-1">LIVE PREVIEW</div>
          <div
            className="relative overflow-hidden rounded-[18px] min-h-[480px] flex flex-col justify-between text-white transition-all duration-500"
            style={{ background: `radial-gradient(circle at 70% 50%, ${accent}28 0%, transparent 55%), linear-gradient(145deg, #2a2a2a, #080808 60%, #1e1e1e)` }}
          >
            {/* Noise overlay */}
            <div className="absolute inset-0 opacity-[.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "128px" }} />
            {/* Glow orb (animated, accent-colored) */}
            <div
              className="absolute top-[-20%] right-[-10%] w-72 h-72 rounded-full blur-3xl transition-all duration-700"
              style={{ background: `${accent}40` }}
            />
            {/* Corner shimmer */}
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.04)_0%,transparent_40%)]" />

            {/* Content */}
            <div className="relative z-10 p-6 md:p-8">
              <div className="font-extrabold text-sm tracking-[.14em] text-white/80 transition-all duration-300">
                {(name || "Your Studio").toUpperCase()}
              </div>
            </div>
            <div className="relative z-10 p-6 md:p-8">
              <span
                className="text-[10px] font-bold tracking-[.18em] transition-colors duration-300"
                style={{ color: accent }}
              >
                PHOTOGRAPHY
              </span>
              <h3 className="font-cormorant text-[52px] md:text-[64px] tracking-[-0.04em] leading-[1.0] mt-2 transition-all duration-300">
                Your next<br />client story.
              </h3>
              <button
                className="mt-6 rounded-xl px-5 py-3 text-xs font-extrabold text-black transition-all duration-300 hover:opacity-90"
                style={{ backgroundColor: accent }}
              >
                View Gallery ↓
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
