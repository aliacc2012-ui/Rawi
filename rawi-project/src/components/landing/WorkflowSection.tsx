const WORKFLOW = [
  {
    number: "01",
    title: "Upload",
    body: "Add your final photos and films.",
    icon: "↥",
  },
  {
    number: "02",
    title: "Customize",
    body: "Apply your studio identity.",
    icon: "✦",
  },
  {
    number: "03",
    title: "Share",
    body: "Send one polished gallery link.",
    icon: "↗",
  },
  {
    number: "04",
    title: "Deliver",
    body: "Clients preview, select and download.",
    icon: "✓",
  },
] as const;

export function WorkflowSection() {
  return (
    <section
      aria-labelledby="rawi-workflow-title"
      className="relative overflow-hidden bg-[#fbf6ef] py-[72px] md:py-[100px]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(196,179,154,.13)_1px,transparent_1px),linear-gradient(90deg,rgba(196,179,154,.13)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="relative mx-auto w-[min(1180px,calc(100%-32px))] md:w-[min(1180px,calc(100%-40px))]">
        <div className="mb-8 md:mb-10">
          <span className="text-[11px] font-extrabold tracking-[.17em] text-gray-500">
            FROM EXPORT TO DELIVERY
          </span>
          <h2
            id="rawi-workflow-title"
            className="mt-3 text-[36px] leading-[1.02] tracking-[-.05em] md:text-[58px]"
          >
            How RAWI works.
          </h2>
        </div>

        <ol className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {WORKFLOW.map((step, index) => (
            <li
              key={step.number}
              className="group relative min-h-[230px] rounded-[24px] border border-[#e3d8c9] bg-white p-6 shadow-[0_12px_35px_rgba(44,35,25,.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(44,35,25,.09)]"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-[15px] bg-rawi-yellow text-sm font-black text-black">
                  {step.number}
                </span>
                <span
                  aria-hidden="true"
                  className="grid h-10 w-10 place-items-center rounded-full bg-[#f7f3ed] text-lg text-black/55 transition group-hover:bg-black group-hover:text-rawi-yellow"
                >
                  {step.icon}
                </span>
              </div>
              <h3 className="mt-10 text-xl font-extrabold uppercase tracking-[-.02em]">
                {step.title}
              </h3>
              <p className="mt-3 max-w-[230px] text-sm leading-6 text-gray-500">
                {step.body}
              </p>
              {index < WORKFLOW.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 -right-[22px] z-10 hidden -translate-y-1/2 text-2xl font-light text-[#bcae9b] lg:block"
                >
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
