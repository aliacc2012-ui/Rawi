import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support — RAWI",
  description: "Get help with RAWI accounts, uploads, galleries and billing.",
};

const TOPICS = [
  { icon: "↥", title: "Uploads", body: "For interrupted uploads, unsupported files, storage limits or missing thumbnails.", subject: "RAWI upload support" },
  { icon: "▣", title: "Galleries", body: "For publishing, gallery links, passwords, downloads, favorites or client access.", subject: "RAWI gallery support" },
  { icon: "◎", title: "Account", body: "For verification emails, sign-in, password reset, workspace access or account deletion.", subject: "RAWI account support" },
  { icon: "AED", title: "Billing", body: "For plan activation, incorrect charges, payment status, upgrades or refund requests.", subject: "RAWI billing support" },
];

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#fbf6ef] px-4 py-7 text-[#111] md:px-6 md:py-12">
      <div className="mx-auto max-w-[1080px]">
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 font-black tracking-[.12em]"><span className="grid h-10 w-10 -rotate-[8deg] place-items-center rounded-[50%_50%_50%_8px] bg-rawi-yellow text-sm">R</span>RAWI</Link>
          <Link href="/login" className="rounded-full border border-black/15 bg-white px-4 py-2.5 text-xs font-bold">Open RAWI</Link>
        </header>

        <section className="py-14 text-center md:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3.5 py-2 text-[10px] font-extrabold tracking-[.14em] text-gray-500 shadow-sm"><span className="h-2 w-2 rounded-full bg-rawi-yellow" />RAWI SUPPORT</div>
          <h1 className="mx-auto mt-6 max-w-3xl text-[46px] font-medium leading-[.95] tracking-[-.06em] sm:text-[62px] md:text-[78px]">How can we help?</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-gray-500">Tell us what happened and include the email connected to your workspace. Access and payment issues are prioritised.</p>
          <a href="mailto:ali.acc2012@gmail.com?subject=RAWI%20support%20request" className="mt-8 inline-flex rounded-full bg-rawi-yellow px-6 py-4 text-sm font-black shadow-[0_14px_35px_rgba(255,200,0,.2)]">Email RAWI support →</a>
          <p className="mt-3 text-xs text-gray-400">ali.acc2012@gmail.com</p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {TOPICS.map((topic) => (
            <article key={topic.title} className="rounded-[24px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(55,42,24,.05)] md:p-7">
              <div className="grid h-11 w-11 place-items-center rounded-[13px] bg-black text-xs font-black text-rawi-yellow">{topic.icon}</div>
              <h2 className="mt-7 text-2xl font-bold tracking-[-.035em]">{topic.title}</h2>
              <p className="mt-2 min-h-[52px] text-sm leading-6 text-gray-500">{topic.body}</p>
              <a href={`mailto:ali.acc2012@gmail.com?subject=${encodeURIComponent(topic.subject)}`} className="mt-5 inline-flex border-b border-black pb-1 text-sm font-bold">Get help →</a>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-[26px] border border-black/10 bg-[#111] p-6 text-white md:p-9">
          <p className="text-[10px] font-bold tracking-[.16em] text-rawi-yellow">HELP US RESOLVE IT FASTER</p>
          <h2 className="mt-3 text-3xl tracking-[-.04em]">Include these details.</h2>
          <ul className="mt-5 grid gap-3 text-sm text-white/65 sm:grid-cols-2">
            <li>✓ Your RAWI account email</li><li>✓ Project or gallery name</li><li>✓ What you expected to happen</li><li>✓ Screenshot of the error, if available</li>
          </ul>
          <p className="mt-6 border-t border-white/10 pt-5 text-xs leading-5 text-white/40">Never email your password, verification code or complete payment-card details. RAWI support will not ask for them.</p>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 py-8 text-xs text-gray-500">
          <span>© 2026 RAWI • راوي</span>
          <nav className="flex gap-5"><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link><Link href="/demo/today-drive">Demo gallery</Link></nav>
        </footer>
      </div>
    </main>
  );
}
