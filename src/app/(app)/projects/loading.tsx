export default function ProjectsLoading() {
  return (
    <div className="max-w-[1500px] mx-auto pb-8 animate-pulse" aria-busy="true" aria-label="Loading projects">
      {/* Page header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="h-3 w-36 rounded-full bg-white/[.05]" />
          <div className="mt-3 h-14 w-56 rounded-xl bg-white/[.07]" />
          <div className="mt-3 h-4 w-80 rounded-full bg-white/[.04]" />
        </div>
        {/* New project button placeholder */}
        <div className="h-11 w-36 rounded-xl bg-rawi-yellow/60" />
      </div>

      {/* Stats strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-[18px] border border-white/[.06] bg-rawi-panel p-4">
            <div className="h-4 w-4 rounded bg-white/[.06] mb-4" />
            <div className="h-7 w-12 rounded-md bg-white/[.08] mb-1" />
            <div className="h-3 w-20 rounded-full bg-white/[.05]" />
          </div>
        ))}
      </div>

      {/* Project cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-[22px] border border-white/[.06] bg-rawi-panel overflow-hidden">
            {/* Cover image area */}
            <div className="h-44 w-full bg-white/[.05]" />
            {/* Card body */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-5 w-40 rounded-md bg-white/[.08]" />
                <div className="h-5 w-16 rounded-full bg-white/[.05]" />
              </div>
              <div className="h-3 w-28 rounded-full bg-white/[.04] mb-4" />
              <div className="flex gap-2">
                <div className="h-3 w-20 rounded-full bg-white/[.05]" />
                <div className="h-3 w-20 rounded-full bg-white/[.04]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="sr-only">Loading projects…</p>
    </div>
  );
}
