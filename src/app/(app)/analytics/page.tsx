import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function AnalyticsPage() {
  const { workspace } = await getCurrentWorkspace();
  const supabase = await createClient();
  const paidAnalytics = workspace!.plan !== "free";

  const { data: projects } = await supabase.from("projects").select("id, name").eq("workspace_id", workspace!.id);
  const projectIds = (projects ?? []).map((p) => p.id);
  let galleries: { id: string; project_id: string; title: string; status: string }[] = [];
  if (projectIds.length > 0) {
    const { data } = await supabase.from("galleries").select("id, project_id, title, status").in("project_id", projectIds);
    galleries = data ?? [];
  }

  const galleryIds = galleries.map((g) => g.id);
  let viewsRows: { gallery_id: string }[] = [];
  let downloadsRows: { gallery_id: string }[] = [];
  let favoritesRows: { gallery_id: string }[] = [];

  if (galleryIds.length > 0) {
    if (paidAnalytics) {
      const [viewsRes, downloadsRes, favoritesRes] = await Promise.all([
        supabase.from("gallery_views").select("gallery_id").in("gallery_id", galleryIds),
        supabase.from("downloads").select("gallery_id").in("gallery_id", galleryIds),
        supabase.from("favorites").select("gallery_id").in("gallery_id", galleryIds),
      ]);
      viewsRows = viewsRes.data ?? [];
      downloadsRows = downloadsRes.data ?? [];
      favoritesRows = favoritesRes.data ?? [];
    } else {
      const { data } = await supabase.from("gallery_views").select("gallery_id").in("gallery_id", galleryIds);
      viewsRows = data ?? [];
    }
  }

  const views = viewsRows.length;
  const downloads = downloadsRows.length;
  const favorites = favoritesRows.length;
  const published = galleries.filter((g) => g.status === "published").length;
  const engagement = views > 0 ? Math.round(((downloads + favorites) / views) * 100) : 0;

  if (!paidAnalytics) {
    return <div className="max-w-[1500px] mx-auto pb-8"><Header plan="FREE"/><div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5"><Stat label="Gallery views" value={views} icon="◉"/><Stat label="Published" value={published} icon="●"/><Stat label="Total galleries" value={galleries.length} icon="▣"/></div><div className="relative overflow-hidden rounded-[24px] border border-gray-200 bg-white p-6 md:p-8 shadow-sm"><div className="absolute right-[-70px] top-[-90px] h-64 w-64 rounded-full bg-rawi-yellow/20 blur-3xl"/><div className="relative max-w-2xl"><span className="text-[10px] font-extrabold tracking-[.18em] text-[#b59600]">CREATOR ANALYTICS</span><h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-[-.045em]">Know what clients actually engage with.</h2><p className="mt-4 text-sm leading-6 text-gray-500">Upgrade to Creator or Pro to unlock downloads, favorites, engagement rate, gallery-by-gallery performance and your top-performing delivery.</p><div className="mt-6 grid sm:grid-cols-3 gap-3"><LockedMetric label="Downloads"/><LockedMetric label="Favorites"/><LockedMetric label="Engagement"/></div><Link href="/settings" className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-extrabold text-white">View upgrade options →</Link></div></div></div>;
  }

  const byGallery = galleries.map((gallery) => ({ id: gallery.id, title: gallery.title, views: viewsRows.filter((r) => r.gallery_id === gallery.id).length, downloads: downloadsRows.filter((r) => r.gallery_id === gallery.id).length, favorites: favoritesRows.filter((r) => r.gallery_id === gallery.id).length })).sort((a, b) => (b.views + b.downloads + b.favorites) - (a.views + a.downloads + a.favorites));
  const top = byGallery[0];
  const maxActivity = Math.max(1, ...byGallery.map((g) => g.views + g.downloads + g.favorites));

  return <div className="max-w-[1500px] mx-auto pb-8"><Header plan={workspace!.plan.toUpperCase()}/><div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5"><Stat label="Gallery views" value={views} icon="◉"/><Stat label="Downloads" value={downloads} icon="↓"/><Stat label="Favorites" value={favorites} icon="♡"/><Stat label="Published" value={published} icon="●"/><Stat label="Engagement" value={`${engagement}%`} icon="↗" accent/></div><div className="grid grid-cols-1 xl:grid-cols-[1.25fr_.75fr] gap-5"><div className="bg-white border border-gray-200 rounded-[22px] p-5 shadow-sm"><div className="flex items-start justify-between gap-3 mb-6"><div><h2 className="text-xl font-bold">Gallery performance</h2><p className="text-xs text-gray-400 mt-1">Relative activity across your published work.</p></div><span className="text-[10px] text-gray-400">VIEWS + DOWNLOADS + FAVORITES</span></div>{byGallery.length>0?<div className="space-y-5">{byGallery.slice(0,8).map((g)=>{const activity=g.views+g.downloads+g.favorites;return <div key={g.id}><div className="flex items-center justify-between text-sm mb-2"><span className="font-bold">{g.title}</span><span className="text-gray-400 text-xs">{g.views} views · {g.downloads} ↓ · {g.favorites} ♡</span></div><div className="h-2 bg-[#f0f0ee] rounded-full overflow-hidden"><div className="h-full rounded-full bg-black" style={{width:`${Math.max(5,(activity/maxActivity)*100)}%`}}/></div></div>})}</div>:<Empty text="Publish and share a gallery to start collecting performance data."/>}</div><div className="space-y-5"><div className="rounded-[22px] bg-black text-white p-5 min-h-[220px] flex flex-col justify-between shadow-sm"><div><span className="text-[10px] tracking-[.17em] text-rawi-yellow font-bold">TOP GALLERY</span><h2 className="text-3xl tracking-[-.04em] mt-3">{top?.title??"No activity yet"}</h2></div><div className="grid grid-cols-3 gap-2 mt-8"><DarkMetric label="Views" value={top?.views??0}/><DarkMetric label="Downloads" value={top?.downloads??0}/><DarkMetric label="Favorites" value={top?.favorites??0}/></div></div><div className="bg-white border border-gray-200 rounded-[22px] p-5 shadow-sm"><h2 className="text-xl font-bold">What to watch</h2><div className="mt-4 space-y-3"><Insight icon="◉" title="Views" text="How many times clients opened your galleries."/><Insight icon="↓" title="Downloads" text="A strong signal that delivery is complete."/><Insight icon="♡" title="Favorites" text="Shows which work connects most with clients."/></div></div></div></div></div>;
}
function Header({plan}:{plan:string}){return <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-7"><div><span className="text-[11px] font-extrabold tracking-[0.18em] text-gray-400">{plan} WORKSPACE</span><h1 className="text-[34px] md:text-[42px] tracking-[-0.05em] leading-none mt-3">Analytics</h1><p className="text-gray-400 mt-2">See how clients engage with your galleries and delivered work.</p></div><div className="rounded-full bg-white border border-gray-200 px-4 py-2 text-xs font-bold shadow-sm">All time ▾</div></div>}
function Stat({label,value,icon,accent=false}:{label:string;value:string|number;icon:string;accent?:boolean}){return <div className={`rounded-[18px] border p-4 shadow-sm ${accent?"bg-rawi-yellow border-rawi-yellow":"bg-white border-gray-200"}`}><div className="flex items-center justify-between"><span className="text-[11px] text-gray-500">{label}</span><span>{icon}</span></div><div className="text-3xl font-extrabold tracking-[-.05em] mt-4">{value}</div></div>}
function LockedMetric({label}:{label:string}){return <div className="rounded-2xl border border-gray-200 bg-[#fafafa] p-4"><div className="flex items-center justify-between"><span className="text-xs font-bold text-gray-500">{label}</span><span className="text-xs">🔒</span></div><div className="mt-3 h-7 w-16 rounded-lg bg-gray-200"/></div>}
function DarkMetric({label,value}:{label:string;value:number}){return <div className="rounded-xl bg-white/10 p-3"><div className="text-[10px] text-white/50">{label}</div><div className="text-xl font-bold mt-1">{value}</div></div>}
function Insight({icon,title,text}:{icon:string;title:string;text:string}){return <div className="flex gap-3"><div className="w-9 h-9 rounded-xl bg-[#fff8df] grid place-items-center shrink-0">{icon}</div><div><div className="text-sm font-bold">{title}</div><div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{text}</div></div></div>}
function Empty({text}:{text:string}){return <div className="py-16 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-2xl">{text}</div>}
