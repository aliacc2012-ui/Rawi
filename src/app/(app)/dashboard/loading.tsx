export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-[1500px] animate-pulse pb-8" aria-busy="true" aria-label="Loading your RAWI workspace">
      <header className="mb-7 flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
        <div className="w-full max-w-xl">
          <div className="h-3 w-36 rounded-full bg-gray-200" />
          <div className="mt-4 h-11 w-4/5 rounded-xl bg-gray-200" />
          <div className="mt-3 h-6 w-3/5 rounded-lg bg-gray-100" />
          <div className="mt-6 flex gap-3">
            <div className="h-11 w-32 rounded-xl bg-rawi-yellow/70" />
            <div className="h-11 w-32 rounded-xl bg-gray-200" />
          </div>
        </div>
        <div className="h-24 w-full rounded-[20px] border bg-white xl:w-72" />
      </header>

      <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="min-h-[120px] rounded-[20px] border bg-white p-4">
            <div className="h-5 w-5 rounded-md bg-gray-200" />
            <div className="mt-5 h-7 w-14 rounded-md bg-gray-200" />
            <div className="mt-2 h-3 w-20 rounded-full bg-gray-100" />
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.12fr_.88fr]">
        <div className="rounded-[22px] border bg-white p-5">
          <div className="mb-4 h-6 w-40 rounded-md bg-gray-200" />
          <div className="min-h-[330px] rounded-2xl bg-[#171717] p-8">
            <div className="mt-48 h-9 w-2/3 rounded-lg bg-white/10" />
            <div className="mt-3 h-4 w-1/3 rounded-full bg-white/10" />
          </div>
        </div>
        <div className="rounded-[22px] border bg-white p-5">
          <div className="mb-5 h-6 w-28 rounded-md bg-gray-200" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 border-b border-gray-100 py-4">
              <div className="h-4 w-4 rounded bg-gray-200" />
              <div className="h-4 w-2/3 rounded-full bg-gray-100" />
            </div>
          ))}
        </div>
      </section>

      <p className="sr-only">Loading your RAWI workspace…</p>
    </div>
  );
}
