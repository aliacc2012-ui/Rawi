"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/(app)/actions";

type IconProps = { className?: string };

function HomeIcon({ className = "" }: IconProps) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="m3 10 9-7 9 7"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-7h6v7"/></svg>; }
function ProjectsIcon({ className = "" }: IconProps) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><rect x="3" y="5" width="18" height="15" rx="2"/><path d="m3 9 5-4 3 4"/><circle cx="16.5" cy="13.5" r="2.5"/><path d="m5 18 5-5 4 4 2-2 3 3"/></svg>; }
function AnalyticsIcon({ className = "" }: IconProps) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></svg>; }
function BrandingIcon({ className = "" }: IconProps) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a1.5 1.5 0 0 1 0-3h2a7 7 0 0 0-2-11Z"/><circle cx="7.5" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="10" cy="6.5" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="8" r="1" fill="currentColor" stroke="none"/></svg>; }
function AdminIcon({ className = "" }: IconProps) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="M12 3 4.5 6v5c0 5 3.2 8.3 7.5 10 4.3-1.7 7.5-5 7.5-10V6L12 3Z"/><path d="M9 12.5 11 14l4-4"/></svg>; }
function CrownIcon({ className = "" }: IconProps) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="m3 7 4.5 4L12 5l4.5 6L21 7l-2 10H5L3 7Z"/><path d="M5 20h14"/></svg>; }

const LINKS = [
  { href: "/dashboard", label: "Home", Icon: HomeIcon },
  { href: "/projects", label: "Projects", Icon: ProjectsIcon },
  { href: "/analytics", label: "Analytics", Icon: AnalyticsIcon },
  { href: "/settings", label: "Branding", Icon: BrandingIcon },
  { href: "/admin", label: "Admin", Icon: AdminIcon },
];

export function Sidebar({ storageUsedBytes, storageLimitBytes }: { storageUsedBytes: number; storageLimitBytes: number }) {
  const pathname = usePathname();
  const pct = storageLimitBytes > 0 ? Math.min(100, (storageUsedBytes / storageLimitBytes) * 100) : 0;
  const gb = (bytes: number) => (bytes / 1024 ** 3).toFixed(1);

  return <>
    <aside className="hidden md:flex bg-rawi-ink text-white p-5 flex-col w-[230px] shrink-0 min-h-screen sticky top-0 h-screen">
      <div className="flex items-center gap-2.5 font-extrabold px-1"><span className="w-[32px] h-[32px] rounded-[50%_50%_50%_8px] bg-rawi-yellow grid place-items-center text-black font-black -rotate-[8deg]">R</span><span className="text-[20px] tracking-[0.13em]">RAWI</span></div>
      <nav className="flex flex-col gap-2 mt-10">{LINKS.map((link) => { const active = pathname.startsWith(link.href); const Icon = link.Icon; return <Link key={link.href} href={link.href} className={`relative flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold transition ${active ? "bg-[#1d1d1d] text-white before:absolute before:-left-5 before:w-[3px] before:h-7 before:rounded-full before:bg-rawi-yellow" : "text-gray-400 hover:bg-[#1d1d1d] hover:text-white"}`}><Icon className={`h-[19px] w-[19px] shrink-0 ${active ? "text-rawi-yellow" : "text-gray-500"}`} />{link.label}</Link>; })}</nav>
      <div className="mt-auto"><div className="text-[10px] text-gray-400 flex justify-between mb-2"><span>Storage</span><span>{gb(storageUsedBytes)} / {gb(storageLimitBytes)} GB</span></div><div className="h-1.5 bg-[#292929] rounded-full overflow-hidden mb-4"><div className="h-full bg-rawi-yellow" style={{ width: `${pct}%` }} /></div><Link href="/settings" className="flex items-center gap-2 text-xs text-gray-300 py-3 border-t border-white/10"><CrownIcon className="h-4 w-4 text-rawi-yellow" /> Upgrade plan</Link><Link href="/support" className="mb-3 block text-center text-xs font-bold text-gray-400 hover:text-white">Help & support</Link><form action={signOut}><button type="submit" className="w-full text-gray-300 border border-[#333] rounded-full px-4 py-2.5 text-sm hover:bg-[#1d1d1d]">Sign out</button></form></div>
    </aside>

    <div className="md:hidden sticky top-0 z-40 -mx-4 -mt-4 mb-4 flex items-center justify-between border-b border-black/5 bg-[#f4f4f2]/95 px-4 py-3 backdrop-blur-xl sm:-mx-5 sm:-mt-5 sm:px-5">
      <Link href="/dashboard" className="flex items-center gap-2 font-extrabold" aria-label="RAWI dashboard"><span className="w-[28px] h-[28px] rounded-[50%_50%_50%_8px] bg-rawi-yellow grid place-items-center text-black font-black -rotate-[8deg]">R</span><span className="tracking-[0.12em]">RAWI</span></Link>
      <div className="flex items-center gap-2"><Link href="/support" className="rounded-full px-2 py-2 text-xs font-bold text-gray-500">Help</Link><form action={signOut}><button type="submit" className="rounded-full border border-black/10 bg-white px-3.5 py-2 text-xs font-extrabold shadow-sm active:scale-[.98]">Sign out</button></form></div>
    </div>

    <nav className="md:hidden fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-2xl border border-white/10 bg-[#111]/95 p-1.5 text-white shadow-2xl backdrop-blur-xl" aria-label="Mobile navigation">
      {LINKS.map((link) => { const active = pathname.startsWith(link.href); const Icon = link.Icon; return <Link key={link.href} href={link.href} className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold transition ${active ? "bg-white/10 text-white" : "text-white/45"}`}><Icon className={`h-[18px] w-[18px] ${active ? "text-rawi-yellow" : ""}`} /><span className="truncate">{link.label}</span></Link>; })}
    </nav>
  </>;
}
