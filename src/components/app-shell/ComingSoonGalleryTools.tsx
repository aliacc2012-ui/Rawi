const fields = ["Camera", "Lens", "Location", "Team credits"];

export function ComingSoonGalleryTools() {
  return (
    <div className="mt-5 space-y-4" aria-label="Coming soon gallery tools">
      {/* Gallery Call-to-Action card */}
      <section className="relative overflow-hidden rounded-[20px] border border-rawi-line bg-rawi-panel p-5">
        <ComingSoonBadge />
        <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-white/30">
          Client action
        </p>
        <h3 className="mt-1 text-[18px] font-semibold text-white">
          Gallery call-to-action
        </h3>
        <p className="mt-2 max-w-[230px] text-sm leading-5 text-white/40">
          Turn a finished delivery into the client&rsquo;s next action.
        </p>
        <div className="mt-4 space-y-2 opacity-40 pointer-events-none">
          <div className="rounded-xl border border-rawi-line bg-white/5 px-3.5 py-3 text-sm font-medium text-white/60">
            Book a shoot <span className="float-right text-white/30">&#8964;</span>
          </div>
          <button
            type="button"
            disabled
            className="w-full rounded-xl bg-rawi-yellow py-3 text-sm font-bold text-black"
          >
            Add to gallery
          </button>
        </div>
      </section>

      {/* Photography Details card */}
      <section className="relative overflow-hidden rounded-[20px] border border-rawi-line bg-rawi-panel p-5">
        <ComingSoonBadge />
        <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-white/30">
          Shoot story
        </p>
        <h3 className="mt-1 text-[18px] font-semibold text-white">
          Photography details
        </h3>
        <p className="mt-2 max-w-[230px] text-sm leading-5 text-white/40">
          Credit the gear, place and people behind the work.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 opacity-40 pointer-events-none">
          {fields.map((field) => (
            <div
              key={field}
              className="rounded-xl border border-rawi-line bg-white/5 px-3 py-2.5"
            >
              <span className="block text-[9px] font-extrabold uppercase tracking-[.1em] text-white/30">
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
    <span className="absolute top-5 right-5 rounded-full border border-rawi-yellow/20 bg-rawi-yellow/10 px-2.5 py-1 text-[9px] font-extrabold tracking-[.1em] text-rawi-yellow">
      COMING SOON
    </span>
  );
}
