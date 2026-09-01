import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0C0C1A] flex flex-col items-center justify-center px-6 text-center">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] rounded-full bg-violet-600/[.06] blur-[130px]" />
        <div className="absolute bottom-[5%] right-[-5%] w-[400px] h-[400px] rounded-full bg-rawi-yellow/[.04] blur-[110px]" />
      </div>

      {/* Logo */}
      <Link href="/" className="mb-12 inline-flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
        <span className="font-cormorant text-[28px] tracking-[0.12em] text-[#F0EFFF]">RAWI</span>
      </Link>

      {/* 404 number */}
      <p className="font-cormorant text-[120px] md:text-[180px] leading-none tracking-[-0.04em] text-[#F0EFFF]/[.07] select-none">
        404
      </p>

      {/* Message */}
      <div className="-mt-6 mb-10">
        <h1 className="font-cormorant text-[36px] md:text-[52px] tracking-[-0.03em] leading-none text-[#F0EFFF]">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-white/35 max-w-xs mx-auto leading-relaxed">
          The frame you&apos;re looking for has been moved, renamed, or doesn&apos;t exist.
        </p>
      </div>

      {/* CTA */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-rawi-yellow px-6 py-3 text-sm font-semibold text-[#0C0C1A] transition-opacity hover:opacity-90"
      >
        ← Back to home
      </Link>
    </div>
  );
}
