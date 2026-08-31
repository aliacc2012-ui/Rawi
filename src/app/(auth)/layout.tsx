"use client";

import Link from "next/link";
import { useRef, useCallback } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    panel.style.setProperty("--sx", `${x}%`);
    panel.style.setProperty("--sy", `${y}%`);
  }, []);

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div
        ref={panelRef}
        onMouseMove={handleMouseMove}
        className="hidden md:flex flex-col justify-between text-white p-12 relative overflow-hidden"
        style={{
          backgroundColor: "#06060F",
          backgroundImage: "radial-gradient(circle 280px at var(--sx, 30%) var(--sy, 70%), rgba(240,224,80,0.10) 0%, transparent 70%)",
        }}
      >
        {/* subtle grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <Link href="/" className="relative flex items-center gap-2.5 font-extrabold w-fit" aria-label="Go to RAWI home">
          <span className="w-[30px] h-[30px] rounded-[50%_50%_50%_8px] bg-rawi-yellow grid place-items-center text-black font-black -rotate-[8deg]">
            R
          </span>
          <span className="text-[19px] tracking-[0.12em]">RAWI</span>
        </Link>

        <div className="relative">
          <p className="text-4xl leading-tight tracking-[-0.03em] max-w-md">
            Your work deserves <span className="text-rawi-yellow">better</span> than a Drive link.
          </p>
          <p className="text-gray-400 mt-4 max-w-sm">
            Cinematic, branded client galleries — built for the way creators actually work.
          </p>
        </div>

        <p className="relative text-gray-500 text-sm">RAWI • راوي</p>
      </div>

      <div className="relative flex items-center justify-center p-6 pt-24 sm:p-10 sm:pt-24 md:pt-10">
        <Link href="/" aria-label="Go to RAWI home" className="absolute left-6 top-6 flex items-center gap-2.5 font-extrabold md:hidden">
          <span className="w-[30px] h-[30px] rounded-[50%_50%_50%_8px] bg-rawi-yellow grid place-items-center text-black font-black -rotate-[8deg]">
            R
          </span>
          <span className="text-[19px] tracking-[0.12em]">RAWI</span>
          <span className="font-arabic text-xs text-gray-500">راوي</span>
        </Link>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
