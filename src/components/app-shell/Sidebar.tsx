"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/(app)/actions";

const LINKS = [
  { href: "/dashboard", label: "Home", icon: "⌂" },
  { href: "/projects", label: "Projects", icon: "□" },
  { href: "/analytics", label: "Analytics", icon: "⌁" },
  { href: "/settings", label: "Branding", icon: "◉" },
];

export function Sidebar({ storageUsedBytes, storageLimitBytes }: { storageUsedBytes: number; storageLimitBytes: number }) {
  const pathname = usePathname();
  const pct = storageLimitBytes > 0 ? Math.min(100, (storageUsedBytes / storageLimitBytes) * 100) : 0;
  const gb = (bytes: number) => (bytes / 1024 ** 3).toFixed(1);

  return (
    <aside className="bg-rawi-ink text-white p-5 flex flex-col w-[230px] shrink-0 min-h-screen">
      <div className="flex items-center gap-2.5 font-extrabold px-1">
        <span className="w-[32px] h-[32px] rounded-[50%_50%_50%_8px] bg-rawi-yellow grid place-items-center text-black font-black -rotate-[8deg]">R</span>
        <span className="text-[20px] tracking-[0.13em]">RAWI</span>
      </div>
      <nav className="flex flex-col gap-2 mt-10">
        {LINKS.map((link) => {
          const active = pathname.startsWith(link.href);
          return <Link key={link.href} href={link.href} className={`relative flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold transition ${active ? "bg-[#1d1d1d] text-white before:absolute before:-left-5 before:w-[3px] before:h-7 before:rounded-full before:bg-rawi-yellow" : "text-gray-400 hover:bg-[#1d1d1d] hover:text-white"}`}><span className={active ? "text-rawi-yellow" : "text-gray-500"}>{link.icon}</span>{link.label}</Link>;
        })}
      </nav>
      <div className="mt-auto">
        <div className="text-[10px] text-gray-400 flex justify-between mb-2"><span>Storage</span><span>{gb(storageUsedBytes)} / {gb(storageLimitBytes)} GB</span></div>
        <div className="h-1.5 bg-[#292929] rounded-full overflow-hidden mb-4"><div className="h-full bg-rawi-yellow" style={{ width: `${pct}%` }} /></div>
        <Link href="/settings" className="flex items-center gap-2 text-xs text-gray-300 py-3 border-t border-white/10"><span className="text-rawi-yellow">♛</span> Upgrade plan</Link>
        <form action={signOut}><button type="submit" className="w-full text-gray-300 border border-[#333] rounded-full px-4 py-2.5 text-sm hover:bg-[#1d1d1d]">Sign out</button></form>
      </div>
    </aside>
  );
}
