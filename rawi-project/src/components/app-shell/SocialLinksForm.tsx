"use client";

import { useMemo, useState, useTransition } from "react";
import { updateSocialLinks } from "@/app/(app)/actions";

type SocialKey = "instagram" | "tiktok" | "facebook" | "website" | "whatsapp";
type Links = Record<SocialKey, string>;

const items: { key: SocialKey; name: string; placeholder: string; icon: React.ReactNode }[] = [
  { key: "instagram", name: "Instagram", placeholder: "https://www.instagram.com/yourprofile", icon: <InstagramIcon /> },
  { key: "tiktok", name: "TikTok", placeholder: "https://www.tiktok.com/@yourprofile", icon: <TikTokIcon /> },
  { key: "facebook", name: "Facebook", placeholder: "https://www.facebook.com/yourpage", icon: <FacebookIcon /> },
  { key: "website", name: "Website", placeholder: "https://www.yourwebsite.com", icon: <WebsiteIcon /> },
  { key: "whatsapp", name: "WhatsApp", placeholder: "https://wa.me/971501234567", icon: <WhatsAppIcon /> },
];

function normalizeUrl(value: string) {
  const clean = value.trim();
  return clean && !/^https?:\/\//i.test(clean) ? `https://${clean}` : clean;
}

export function SocialLinksForm({ workspaceId, initialLinks }: { workspaceId: string; initialLinks: Links }) {
  const [links, setLinks] = useState<Links>(initialLinks);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const connectedCount = useMemo(() => Object.values(links).filter((v) => normalizeUrl(v)).length, [links]);

  function save() {
    setMessage("");
    startTransition(async () => {
      const normalized = Object.fromEntries(
        Object.entries(links).map(([k, v]) => [k, normalizeUrl(v)])
      ) as Links;

      const result = await updateSocialLinks(workspaceId, normalized);
      if ("error" in result && typeof result.error === "string") {
        setMessage(result.error);
        return;
      }

      setLinks(normalized);
      setMessage("Saved ✓");
    });
  }

  return <div className="mt-5"><div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">{items.map((item,index)=>{const url=normalizeUrl(links[item.key]);return <div key={item.key} className={`grid grid-cols-1 sm:grid-cols-[46px_100px_minmax(0,1fr)_auto_auto] items-center gap-3 p-3.5 ${index!==items.length-1?"border-b border-gray-100":""}`}><div className="w-11 h-11 rounded-xl bg-white grid place-items-center">{item.icon}</div><div className="text-sm font-extrabold">{item.name}</div><input type="url" value={links[item.key]} onChange={(e)=>{setLinks(p=>({...p,[item.key]:e.target.value}));setMessage("");}} placeholder={item.placeholder} className="min-w-0 w-full rounded-xl border border-gray-200 bg-[#fafafa] px-3.5 py-2.5 text-sm outline-none focus:border-black"/>{url?<a href={url} target="_blank" rel="noreferrer" className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs font-extrabold">Visit ↗</a>:<span/>}<button type="button" onClick={()=>{setLinks(p=>({...p,[item.key]:""}));setMessage("");}} className="w-9 h-9 rounded-xl border border-gray-200 text-gray-400">×</button></div>})}</div><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4"><div className="text-xs text-gray-400">{connectedCount} of {items.length} profiles connected</div><div className="flex items-center gap-3">{message&&<span className={`text-xs font-bold ${message.includes("✓")?"text-emerald-600":"text-red-600"}`}>{message}</span>}<button type="button" disabled={pending} onClick={save} className="rounded-xl bg-black text-white px-5 py-3 text-xs font-extrabold disabled:opacity-50">{pending?"Saving…":"Save social links"}</button></div></div><p className="text-[10px] text-gray-400 mt-3">Saved to your RAWI workspace, so these links follow you across devices.</p></div>;
}
function InstagramIcon(){return <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>}
function TikTokIcon(){return <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M15.6 3c.3 2.1 1.5 3.5 3.6 3.9v3.2a8.1 8.1 0 0 1-3.6-1.1v6.3a6.3 6.3 0 1 1-5.5-6.2v3.3a3.1 3.1 0 1 0 2.3 3V3h3.2Z"/></svg>}
function FacebookIcon(){return <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M13.7 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5H17V3.6c-.8-.1-1.6-.2-2.4-.2-2.4 0-4.1 1.5-4.1 4.2v2.3H7.8V13h2.7v8h3.2Z"/></svg>}
function WebsiteIcon(){return <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M3.5 12h17M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21M12 3c-2.3 2.5-3.5 5.5-3.5 9S9.7 18.5 12 21"/></svg>}
function WhatsAppIcon(){return <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.6Z"/><path d="M9 8.5c.4 2.5 2 4.1 4.5 5l1.2-1.2c.3-.3.7-.4 1.1-.2l1.7.8c.4.2.6.6.5 1-.3 1.4-1.4 2.1-2.8 2.1-4 0-7.2-3.2-7.2-7.2 0-1.4.7-2.5 2.1-2.8.4-.1.8.1 1 .5l.8 1.7c.2.4.1.8-.2 1.1L10.5 10"/></svg>}
