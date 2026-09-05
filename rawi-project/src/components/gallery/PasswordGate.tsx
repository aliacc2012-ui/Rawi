"use client";

import { useState, useTransition } from "react";
import { verifyGalleryPassword } from "@/app/g/[slug]/actions";

export function PasswordGate({ galleryId, title }: { galleryId: string; title: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await verifyGalleryPassword(galleryId, password);
      if ("error" in result && typeof result.error === "string") {
        setError(result.error);
        return;
      }
      window.location.reload();
    });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080808] px-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,212,0,.13),transparent_25%),linear-gradient(145deg,#171717,#070707_58%,#111)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-between py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 -rotate-[8deg] place-items-center rounded-[50%_50%_50%_8px] bg-[#FFD400] font-black text-black">R</span>
            <span className="text-sm font-extrabold tracking-[.12em]">RAWI</span>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-[10px] font-bold tracking-[.12em] text-white/45">PRIVATE GALLERY</span>
        </header>

        <section className="py-16">
          <span className="text-[10px] font-extrabold tracking-[.18em] text-[#FFD400]">CLIENT DELIVERY</span>
          <h1 className="mt-4 text-[42px] font-semibold leading-[.95] tracking-[-.055em] sm:text-[52px]">{title}</h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/50">This gallery is private. Enter the password provided by the creator to continue.</p>

          <form onSubmit={handleSubmit} className="mt-8">
            <label htmlFor="gallery-password" className="mb-2 block text-[11px] font-bold uppercase tracking-[.12em] text-white/50">Gallery password</label>
            <input
              id="gallery-password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="h-14 w-full rounded-xl border border-white/15 bg-white/[.06] px-4 text-base text-white outline-none transition placeholder:text-white/25 focus:border-[#FFD400]/70 focus:bg-white/[.08]"
            />
            <div className="min-h-7 pt-2 text-sm text-red-300" role="status" aria-live="polite">{error}</div>
            <button
              type="submit"
              disabled={pending || !password.trim()}
              className="mt-2 flex h-14 w-full items-center justify-center rounded-xl bg-[#FFD400] px-5 text-sm font-extrabold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Checking…" : "Unlock gallery →"}
            </button>
          </form>
        </section>

        <footer className="text-center text-[11px] text-white/30">Secure client delivery · RAWI</footer>
      </div>
    </main>
  );
}
