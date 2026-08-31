import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support — RAWI",
  description: "Get help with RAWI accounts, uploads, galleries and billing.",
};

const TOPICS = [
  {
    icon: "↥",
    title: "Uploads",
    body: "For interrupted uploads, unsupported files, storage limits or missing thumbnails.",
    subject: "RAWI upload support",
    accent: "from-violet-500 to-fuchsia-500",
    glow: "rgba(139,92,246,0.25)",
    border: "hover:border-violet-500/40",
  },
  {
    icon: "▣",
    title: "Galleries",
    body: "For publishing, gallery links, passwords, downloads, favorites or client access.",
    subject: "RAWI gallery support",
    accent: "from-cyan-400 to-sky-500",
    glow: "rgba(34,211,238,0.25)",
    border: "hover:border-cyan-500/40",
  },
  {
    icon: "◎",
    title: "Account",
    body: "For verification emails, sign-in, password reset, workspace access or account deletion.",
    subject: "RAWI account support",
    accent: "from-amber-400 to-yellow-400",
    glow: "rgba(251,191,36,0.25)",
    border: "hover:border-amber-400/40",
  },
  {
    icon: "AED",
    title: "Billing",
    body: "For plan activation, incorrect charges, payment status, upgrades or refund requests.",
    subject: "RAWI billing support",
    accent: "from-emerald-400 to-teal-400",
    glow: "rgba(52,211,153,0.25)",
    border: "hover:border-emerald-400/40",
  },
];

export default function SupportPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-rawi-ink px-4 py-7 text-rawi-soft md:px-6 md:py-12">

      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-1/3 -left-24 h-[380px] w-[380px] rounded-full bg-rawi-yellow/6 blur-[100px]" />
        <div className="absolute top-2/3 -right-16 h-[300px] w-[300px] rounded-full bg-cyan-500/8 blur-[90px]" />
      </div>

      <div className="mx-auto max-w-[1080px]">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 font-black tracking-[.12em] text-white">
            <span className="grid h-10 w-10 -rotate-[8deg] place-items-center rounded-[50%_50%_50%_8px] bg-rawi-yellow text-sm text-black">R</span>
            RAWI
          </Link>
          <Link href="/login" className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white/80 backdrop-blur transition hover:border-rawi-yellow/40 hover:text-rawi-yellow">
            Open RAWI
          </Link>
        </header>

        {/* Hero */}
        <section className="py-16 text-center md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-[10px] font-extrabold tracking-[.14em] text-rawi-yellow backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-rawi-yellow shadow-[0_0_6px_2px_rgba(251,191,36,.5)]" />
            RAWI SUPPORT
          </div>

          <h1 className="font-cormorant mx-auto mt-6 max-w-3xl text-[52px] font-medium italic leading-[.92] tracking-[-0.02em] text-white sm:text-[68px] md:text-[86px]">
            How can we<br />
            <span className="text-rawi-yellow">help?</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/50">
            Tell us what happened and include the email connected to your workspace.
            Access and payment issues are prioritised.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3">
            <a
              href="mailto:ali.acc2012@gmail.com?subject=RAWI%20support%20request"
              className="inline-flex rounded-full bg-rawi-yellow px-8 py-4 text-sm font-black text-black shadow-[0_0_40px_rgba(251,191,36,.35)] transition hover:shadow-[0_0_56px_rgba(251,191,36,.55)]"
            >
              Email RAWI support →
            </a>
            <p className="text-xs text-white/30">ali.acc2012@gmail.com</p>
          </div>
        </section>

        {/* Topic cards */}
        <section className="grid gap-4 sm:grid-cols-2">
          {TOPICS.map((topic) => (
            <article
              key={topic.title}
              className={`group relative overflow-hidden rounded-[24px] border border-white/8 bg-rawi-panel p-6 transition-all duration-300 md:p-7 ${topic.border}`}
            >
              {/* Hover glow */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(ellipse at top left, ${topic.glow} 0%, transparent 65%)` }}
              />

              <div className={`grid h-11 w-11 place-items-center rounded-[13px] bg-gradient-to-br ${topic.accent} text-xs font-black text-black shadow-lg`}>
                {topic.icon}
              </div>

              <h2 className="font-cormorant mt-7 text-3xl font-semibold italic tracking-[-0.02em] text-white">
                {topic.title}
              </h2>
              <p className="mt-2 min-h-[52px] text-sm leading-6 text-white/50">{topic.body}</p>

              <a
                href={`mailto:ali.acc2012@gmail.com?subject=${encodeURIComponent(topic.subject)}`}
                className={`mt-5 inline-flex items-center gap-1.5 bg-gradient-to-r bg-clip-text text-sm font-bold text-transparent transition-opacity hover:opacity-80 ${topic.accent}`}
              >
                Get help →
              </a>
            </article>
          ))}
        </section>

        {/* Tips section */}
        <section className="relative mt-5 overflow-hidden rounded-[26px] border border-white/8 bg-rawi-panel p-6 md:p-9">
          <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-rawi-yellow/8 blur-[70px]" />

          <p className="text-[10px] font-bold tracking-[.16em] text-rawi-yellow">HELP US RESOLVE IT FASTER</p>

          <h2 className="font-cormorant mt-3 text-4xl font-medium italic tracking-[-0.02em] text-white">
            Include these details.
          </h2>

          <ul className="mt-5 grid gap-3 text-sm text-white/55 sm:grid-cols-2">
            {[
              "Your RAWI account email",
              "Project or gallery name",
              "What you expected to happen",
              "Screenshot of the error, if available",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-rawi-yellow">✓</span>
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-6 border-t border-white/8 pt-5 text-xs leading-5 text-white/30">
            Never email your password, verification code or complete payment-card details. RAWI support will not ask for them.
          </p>
        </section>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-4 py-8 text-xs text-white/30">
          <span>© 2026 RAWI • راوي</span>
          <nav className="flex gap-5">
            <Link href="/terms" className="transition hover:text-white/60">Terms</Link>
            <Link href="/privacy" className="transition hover:text-white/60">Privacy</Link>
            <Link href="/demo/today-drive" className="transition hover:text-white/60">Demo gallery</Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}
