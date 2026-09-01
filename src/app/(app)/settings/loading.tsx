export default function SettingsLoading() {
  return (
    <div className="max-w-[1500px] mx-auto pb-8 animate-pulse" aria-busy="true" aria-label="Loading settings">
      {/* Page header */}
      <div className="mb-8">
        <div className="h-3 w-44 rounded-full bg-white/[.05]" />
        <div className="mt-3 h-14 w-64 rounded-xl bg-white/[.07]" />
        <div className="mt-3 h-4 w-96 rounded-full bg-white/[.04]" />
      </div>

      {/* Branding card */}
      <div className="rounded-[22px] border border-white/[.06] bg-rawi-panel p-6 mb-6">
        <div className="h-5 w-32 rounded-md bg-white/[.07] mb-6" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-24 rounded-full bg-white/[.05] mb-2" />
              <div className="h-11 w-full rounded-xl bg-white/[.06]" />
            </div>
          ))}
        </div>
        <div className="mt-5 h-11 w-36 rounded-xl bg-rawi-yellow/60" />
      </div>

      {/* Billing / plan toggle */}
      <div className="rounded-[22px] border border-white/[.06] bg-rawi-panel p-6 mb-6">
        <div className="h-5 w-20 rounded-md bg-white/[.07] mb-6" />
        {/* Toggle */}
        <div className="flex justify-center mb-8">
          <div className="h-8 w-52 rounded-full bg-white/[.06]" />
        </div>
        {/* Plan cards row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-[18px] border border-white/[.06] bg-[#111120] p-5">
              <div className="h-4 w-20 rounded-full bg-white/[.07] mb-3" />
              <div className="h-12 w-28 rounded-lg bg-white/[.08] mb-1" />
              <div className="h-3 w-16 rounded-full bg-white/[.04] mb-6" />
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center gap-2 mb-3">
                  <div className="h-3 w-3 rounded-full bg-white/[.06]" />
                  <div className="h-3 w-40 rounded-full bg-white/[.05]" />
                </div>
              ))}
              <div className="mt-4 h-11 w-full rounded-xl bg-white/[.06]" />
            </div>
          ))}
        </div>
      </div>

      {/* Storage card */}
      <div className="rounded-[22px] border border-white/[.06] bg-rawi-panel p-6">
        <div className="h-5 w-24 rounded-md bg-white/[.07] mb-5" />
        <div className="h-3 w-full rounded-full bg-white/[.06] mb-2" />
        <div className="h-3 w-1/2 rounded-full bg-white/[.04]" />
      </div>

      <p className="sr-only">Loading settings…</p>
    </div>
  );
}
