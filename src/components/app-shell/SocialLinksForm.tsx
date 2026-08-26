"use client";

import { useEffect, useState } from "react";

type SocialKey = "instagram" | "tiktok" | "facebook" | "website";
type Links = Record<SocialKey, string>;

const EMPTY: Links = { instagram: "", tiktok: "", facebook: "", website: "" };

const items: { key: SocialKey; name: string; placeholder: string; icon: React.ReactNode }[] = [
  { key: "instagram", name: "Instagram", placeholder: "https://instagram.com/yourname", icon: <InstagramIcon /> },
  { key: "tiktok", name: "TikTok", placeholder: "https://tiktok.com/@yourname", icon: <TikTokIcon /> },
  { key: "facebook", name: "Facebook", placeholder: "https://facebook.com/yourpage", icon: <FacebookIcon /> },
  { key: "website", name: "Website", placeholder: "https://yourwebsite.com", icon: <WebsiteIcon /> },
];

function normalizeUrl(value: string) {
  const clean = value.trim();
  if (!clean) return "";
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
}

export function SocialLinksForm({ workspaceId }: { workspaceId: string }) {
  const storageKey = `rawi-social-links-${workspaceId}`;
  const [links, setLinks] = useState<Links>(EMPTY);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const existing = window.localStorage.getItem(storageKey);
      if (existing) setLinks({ ...EMPTY, ...JSON.parse(existing) });
    } catch {}
  }, [storageKey]);

  function save() {
    const normalized = Object.fromEntries(Object.entries(links).map(([key, value]) => [key, normalizeUrl(value)])) as Links;
    setLinks(normalized);
    window.localStorage.setItem(storageKey, JSON.stringify(normalized));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className="mt-5">
      <div className="grid gap-3">
        {items.map((item) => {
          const url = normalizeUrl(links[item.key]);
          return (
            <div key={item.key} className="rounded-2xl border border-gray-200 bg-[#fafafa] p-3.5 flex items-center gap-3">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-white border border-gray-200 grid place-items-center text-black">{item.icon}</div>
              <div className="min-w-0 flex-1">
                <label htmlFor={`social-${item.key}`} className="text-xs font-extrabold block mb-1.5">{item.name}</label>
                <input id={`social-${item.key}`} type="url" value={links[item.key]} onChange={(e) => { setLinks((prev) => ({ ...prev, [item.key]: e.target.value })); setSaved(false); }} placeholder={item.placeholder} className="w-full bg-transparent text-sm outline-none placeholder:text-gray-300" />
              </div>
              {url ? <a href={url} target="_blank" rel="noreferrer" aria-label={`Visit ${item.name}`} className="shrink-0 rounded-xl bg-black text-white px-3 py-2 text-[11px] font-extrabold hover:opacity-75 transition">Visit ↗</a> : <span className="shrink-0 text-[10px] text-gray-300 font-bold px-2">ADD LINK</span>}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-4">
        <button type="button" onClick={save} className="rounded-xl bg-black text-white px-5 py-3 text-xs font-extrabold hover:opacity-80 transition">Save social links</button>
        {saved && <span className="text-xs font-bold text-emerald-600">Saved ✓</span>}
      </div>
      <p className="text-[10px] text-gray-400 mt-3">Add the full profile URL. Once saved, use Visit to open the profile instantly.</p>
    </div>
  );
}

function InstagramIcon() { return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.1"/><circle cx="17.5" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>; }
function TikTokIcon() { return <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M15.6 3c.3 2.1 1.5 3.5 3.6 3.9v3.2a8.1 8.1 0 0 1-3.6-1.1v6.3a6.3 6.3 0 1 1-5.5-6.2v3.3a3.1 3.1 0 1 0 2.3 3V3h3.2Z"/></svg>; }
function FacebookIcon() { return <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M13.7 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5H17V3.6c-.8-.1-1.6-.2-2.4-.2-2.4 0-4.1 1.5-4.1 4.2v2.3H7.8V13h2.7v8h3.2Z"/></svg>; }
function WebsiteIcon() { return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3.5 12h17M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21M12 3c-2.3 2.5-3.5 5.5-3.5 9S9.7 18.5 12 21"/></svg>; }
