"use client";

import { useEffect, useMemo, useState } from "react";

type SocialKey = "instagram" | "tiktok" | "facebook" | "website";
type Links = Record<SocialKey, string>;

const EMPTY: Links = { instagram: "", tiktok: "", facebook: "", website: "" };

const items: { key: SocialKey; name: string; placeholder: string; icon: React.ReactNode }[] = [
  { key: "instagram", name: "Instagram", placeholder: "https://www.instagram.com/yourprofile", icon: <InstagramIcon /> },
  { key: "tiktok", name: "TikTok", placeholder: "https://www.tiktok.com/@yourprofile", icon: <TikTokIcon /> },
  { key: "facebook", name: "Facebook", placeholder: "https://www.facebook.com/yourpage", icon: <FacebookIcon /> },
  { key: "website", name: "Website", placeholder: "https://www.yourwebsite.com", icon: <WebsiteIcon /> },
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

  const connectedCount = useMemo(() => Object.values(links).filter((value) => normalizeUrl(value)).length, [links]);

  function updateLink(key: SocialKey, value: string) {
    setLinks((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function clearLink(key: SocialKey) {
    setLinks((prev) => ({ ...prev, [key]: "" }));
    setSaved(false);
  }

  function save() {
    const normalized = Object.fromEntries(Object.entries(links).map(([key, value]) => [key, normalizeUrl(value)])) as Links;
    setLinks(normalized);
    window.localStorage.setItem(storageKey, JSON.stringify(normalized));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className="mt-5">
      <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
        {items.map((item, index) => {
          const url = normalizeUrl(links[item.key]);
          return (
            <div key={item.key} className={`grid grid-cols-[46px_110px_minmax(0,1fr)_auto_auto] items-center gap-3 p-3.5 ${index !== items.length - 1 ? "border-b border-gray-100" : ""}`}>
              <div className="w-11 h-11 rounded-xl bg-white grid place-items-center overflow-hidden">{item.icon}</div>
              <div className="text-sm font-extrabold">{item.name}</div>
              <input
                id={`social-${item.key}`}
                type="url"
                value={links[item.key]}
                onChange={(e) => updateLink(item.key, e.target.value)}
                placeholder={item.placeholder}
                className="min-w-0 w-full rounded-xl border border-gray-200 bg-[#fafafa] px-3.5 py-2.5 text-sm outline-none focus:border-black transition placeholder:text-gray-300"
              />
              {url ? (
                <a href={url} target="_blank" rel="noreferrer" aria-label={`Visit ${item.name}`} className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-extrabold hover:bg-gray-50 transition whitespace-nowrap">
                  Visit ↗
                </a>
              ) : (
                <button type="button" disabled className="rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-2.5 text-xs font-extrabold text-gray-300 whitespace-nowrap">Visit ↗</button>
              )}
              <button type="button" onClick={() => clearLink(item.key)} aria-label={`Clear ${item.name} link`} className="w-9 h-9 rounded-xl border border-gray-200 text-gray-400 hover:text-black hover:bg-gray-50 transition">×</button>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
        <div className="text-xs text-gray-400">{connectedCount} of {items.length} profiles connected</div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs font-bold text-emerald-600">Saved ✓</span>}
          <button type="button" onClick={save} className="rounded-xl bg-black text-white px-5 py-3 text-xs font-extrabold hover:opacity-80 transition">Save social links</button>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 mt-3">Paste the full profile URL. After saving, click Visit to open the profile instantly in a new tab.</p>
    </div>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 48 48" width="42" height="42" aria-hidden="true">
      <defs>
        <radialGradient id="igA" cx="30%" cy="105%" r="120%"><stop offset="0%" stopColor="#ffd600"/><stop offset="35%" stopColor="#ff7a00"/><stop offset="65%" stopColor="#ff0169"/><stop offset="100%" stopColor="#d300c5"/></radialGradient>
      </defs>
      <rect x="3" y="3" width="42" height="42" rx="12" fill="url(#igA)"/>
      <rect x="12" y="12" width="24" height="24" rx="7" fill="none" stroke="white" strokeWidth="3"/>
      <circle cx="24" cy="24" r="6" fill="none" stroke="white" strokeWidth="3"/>
      <circle cx="32" cy="16" r="2" fill="white"/>
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 48 48" width="42" height="42" aria-hidden="true">
      <rect x="3" y="3" width="42" height="42" rx="12" fill="#050505"/>
      <path d="M27 11c.5 4 2.6 6.6 6.8 7.4v5c-2.5-.1-4.7-.8-6.8-2.2v8.2c0 5.1-3.7 8.6-8.4 8.6-4.6 0-8.2-3.5-8.2-8 0-4.8 3.8-8.4 8.6-8.4.6 0 1.2.1 1.8.2v5.1a4.6 4.6 0 0 0-1.7-.4c-2 0-3.5 1.5-3.5 3.4 0 1.8 1.5 3.3 3.3 3.3 2.1 0 3.6-1.5 3.6-4V11H27Z" fill="#25F4EE" opacity=".95" transform="translate(-1,1)"/>
      <path d="M28 10c.5 4 2.6 6.6 6.8 7.4v5c-2.5-.1-4.7-.8-6.8-2.2v8.2c0 5.1-3.7 8.6-8.4 8.6-4.6 0-8.2-3.5-8.2-8 0-4.8 3.8-8.4 8.6-8.4.6 0 1.2.1 1.8.2v5.1a4.6 4.6 0 0 0-1.7-.4c-2 0-3.5 1.5-3.5 3.4 0 1.8 1.5 3.3 3.3 3.3 2.1 0 3.6-1.5 3.6-4V10H28Z" fill="#FE2C55" opacity=".92" transform="translate(1,-1)"/>
      <path d="M27.5 10.5c.5 4 2.6 6.6 6.8 7.4v4.2c-2.4-.2-4.7-1-6.8-2.3v8.9c0 5-3.6 8.3-8.1 8.3-4.4 0-7.8-3.3-7.8-7.7 0-4.5 3.6-7.9 8.1-7.9.5 0 1.1.1 1.6.2v4.7a4.6 4.6 0 0 0-1.6-.3c-2.1 0-3.7 1.5-3.7 3.5 0 1.9 1.5 3.4 3.4 3.4 2.2 0 3.8-1.6 3.8-4.2V10.5h4.3Z" fill="white"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 48 48" width="42" height="42" aria-hidden="true">
      <circle cx="24" cy="24" r="21" fill="#1877F2"/>
      <path d="M27.6 39V26.3h4.3l.7-5h-5v-3.2c0-1.5.4-2.5 2.6-2.5H33v-4.5c-1.3-.2-2.7-.3-4-.3-4 0-6.8 2.5-6.8 7v3.5h-4.5v5h4.5V39h5.4Z" fill="white"/>
    </svg>
  );
}

function WebsiteIcon() {
  return (
    <svg viewBox="0 0 48 48" width="42" height="42" aria-hidden="true">
      <rect x="3" y="3" width="42" height="42" rx="12" fill="#f7f7f7" stroke="#dedede"/>
      <circle cx="24" cy="24" r="13" fill="none" stroke="#111" strokeWidth="2.5"/>
      <path d="M11 24h26M24 11c3.2 3.5 5 8 5 13s-1.8 9.5-5 13M24 11c-3.2 3.5-5 8-5 13s1.8 9.5 5 13" fill="none" stroke="#111" strokeWidth="2"/>
    </svg>
  );
}
