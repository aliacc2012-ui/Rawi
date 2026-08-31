const fields = ["Camera", "Lens", "Location", "Team credits"];

export function ComingSoonGalleryTools() {
  return (
    <div className="mt-5 space-y-4" aria-label="Coming soon gallery tools">
      <section className="relative overflow-hidden rounded-[20px] border border-white/[.07] bg-rawi-panel p-5">
        <ComingSoonBadge />
        <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-white/45">
          Client action
        </p>
        <h3 className="mt-1 text-[18px] font-semibold">
          Gallery call-to-action
        </h3>
        <p className="mt-2 max-w-[230px] text-sm leading-5 text-white/45">
          Turn a finished delivery into the client&rsquo;s next action.
        </p>
        <div className="mt-4 space-y-2 opacity-60">
          <div className="rounded-xl border border-white/[.07] bg-rawi-panel/[.03] px-3.5 py-3 text-sm font-medium text-white/55">
            Book a shoot <span className="float-right">⌄</span>
          </div>
          <button
            type="button"
            disabled
            className="w-full rounded-xl bg-black py-3 text-sm font-bold text-white"
          >
            Add to gallery
          </button>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[20px] border border-white/[.07] bg-rawi-panel p-5">
        <ComingSoonBadge />
        <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-white/45">
          Shoot story
        </p>
        <h3 className="mt-1 text-[18px] font-semibold">Photography details</h3>
        <p className="mt-2 max-w-[230px] text-sm leading-5 text-white/45">
          Credit the gear, place and people behind the work.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 opacity-60">
          {fields.map((field) => (
            <div
              key={field}
              className="rounded-xl border border-white/[.07] bg-rawi-panel/[.03] px-3 py-2.5"
            >
              <span className="block text-[9px] font-extrabold uppercase tracking-[.1em] text-white/45">
                {field}
              </span>
              <span className="mt-1 block text-xs text-white/40">
                Add details
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ComingSoonBadge() {
  return (
    <span className="absolute top-5 right-5 rounded-full bg-[#fff8d5] px-2.5 py-1 text-[9px] font-extrabold tracking-[.1em] text-[#806a00]">
      COMING SOON
    </span>
  );
}
