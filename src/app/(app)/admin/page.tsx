import { getCurrentWorkspace } from "@/lib/workspace";
import { createClient } from "@/lib/supabase/server";
import { BillingSettingsForm } from "@/components/app-shell/BillingSettingsForm";
import { SocialLinksForm } from "@/components/app-shell/SocialLinksForm";
import { ThumbnailBackfill } from "@/components/app-shell/ThumbnailBackfill";
import { WorkspaceLogoForm } from "@/components/app-shell/WorkspaceLogoForm";

type WorkspaceWithBillingSettings = { id:string; plan?:string|null; storage_used_bytes?:number|null; storage_limit_bytes?:number|null; renewal_reminder_days?:number|null };
type DownloadRow={media_id:string;created_at:string};
type MediaRow={id:string;file_size:number};

function gb(bytes:number){return bytes/1024**3}
function fmtGb(bytes:number){const value=gb(bytes);return value<1?`${Math.round(bytes/1024**2)} MB`:`${value.toFixed(value>=100?0:1)} GB`}
function MetricIcon({type}:{type:"storage"|"download"|"cost"|"health"}){const common="h-5 w-5";if(type==="storage")return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>;if(type==="download")return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}><path d="M12 3v12m-5-5 5 5 5-5M5 21h14"/></svg>;if(type==="cost")return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5c-.7-1-1.8-1.5-3.4-1.5-1.8 0-3.1.9-3.1 2.3 0 3.7 6.5 1.5 6.5 5.4 0 1.4-1.3 2.3-3.3 2.3-1.6 0-2.9-.6-3.7-1.7M12 5v14"/></svg>;return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}><path d="M3 12h4l2-6 4 12 2-6h6"/></svg>}

export default async function AdminPage(){
  const{workspace}=await getCurrentWorkspace();
  const supabase=await createClient();
  const billingWorkspace=workspace as WorkspaceWithBillingSettings;
  const days=Number(billingWorkspace?.renewal_reminder_days??3);
  const[{data:social},{data:projectRows}]=await Promise.all([
    supabase.from("workspaces").select("logo_url,instagram_url,tiktok_url,facebook_url,website_url,whatsapp_url").eq("id",workspace!.id).single(),
    supabase.from("projects").select("id").eq("workspace_id",workspace!.id)
  ]);
  const initialLinks={instagram:social?.instagram_url||"",tiktok:social?.tiktok_url||"",facebook:social?.facebook_url||"",website:social?.website_url||"",whatsapp:social?.whatsapp_url||""};
  const projectIds=(projectRows??[]).map(p=>p.id);
  let optimizableImages=0;
  let downloadBytes30d=0;
  let downloadCount30d=0;
  if(projectIds.length){
    const since=new Date(Date.now()-30*24*60*60*1000).toISOString();
    const[{count},{data:mediaRows},{data:galleryRows}]=await Promise.all([
      supabase.from("media").select("id",{count:"exact",head:true}).in("project_id",projectIds).eq("media_type","image"),
      supabase.from("media").select("id,file_size").in("project_id",projectIds),
      supabase.from("galleries").select("id").in("project_id",projectIds)
    ]);
    optimizableImages=count??0;
    const galleryIds=(galleryRows??[]).map(g=>g.id);
    if(galleryIds.length){
      const{data:downloadRows}=await supabase.from("downloads").select("media_id,created_at").in("gallery_id",galleryIds).gte("created_at",since);
      const sizes=new Map((mediaRows??[] as MediaRow[]).map(m=>[m.id,Number(m.file_size||0)]));
      const rows=(downloadRows??[]) as DownloadRow[];
      downloadCount30d=rows.length;
      downloadBytes30d=rows.reduce((sum,row)=>sum+(sizes.get(row.media_id)||0),0);
    }
  }
  const used=Number(billingWorkspace.storage_used_bytes??0);
  const limit=Number(billingWorkspace.storage_limit_bytes??0);
  const storagePct=limit>0?Math.min(100,(used/limit)*100):0;
  const estimatedCachedCostAed=gb(downloadBytes30d)*0.03*3.6725;
  const estimatedOriginCostAed=gb(downloadBytes30d)*0.09*3.6725;
  return <div className="max-w-[1100px] mx-auto pb-8"><div className="mb-7"><span className="text-[11px] font-extrabold tracking-[0.18em] text-white/45">RAWI ADMIN</span><h1 className="text-[34px] md:text-[42px] tracking-[-0.05em] leading-none mt-3">System settings</h1><p className="text-white/45 mt-2">Manage operational settings without changing code or Vercel configuration.</p></div><div className="space-y-5">
    <section className="bg-rawi-panel border border-white/[.07] rounded-[22px] p-5 md:p-6 shadow-sm"><div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3"><div><div className="flex items-center gap-2"><span className="w-9 h-9 rounded-xl bg-[#fff8df] text-black grid place-items-center"><MetricIcon type="health"/></span><h2 className="text-xl font-bold">Infrastructure usage</h2></div><p className="text-sm text-white/45 mt-2">Monitor RAWI storage and estimated client download traffic before infrastructure costs become a problem.</p></div><span className="self-start rounded-full bg-[#f5f5f3] border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider">{billingWorkspace.plan||"free"} plan</span></div><div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5"><UsageMetric icon="storage" label="Storage used" value={fmtGb(used)} detail={limit?`of ${fmtGb(limit)}`:""}/><UsageMetric icon="download" label="Downloads · 30d" value={String(downloadCount30d)} detail={`${fmtGb(downloadBytes30d)} estimated traffic`}/><UsageMetric icon="cost" label="Cached estimate" value={`AED ${estimatedCachedCostAed.toFixed(2)}`} detail="at $0.03 / GB"/><UsageMetric icon="cost" label="Origin estimate" value={`AED ${estimatedOriginCostAed.toFixed(2)}`} detail="at $0.09 / GB"/></div><div className="mt-5"><div className="flex justify-between text-xs font-bold mb-2"><span>Workspace storage</span><span>{storagePct.toFixed(1)}%</span></div><div className="h-2 rounded-full bg-[#efefed] overflow-hidden"><div className="h-full rounded-full bg-black" style={{width:`${storagePct}%`}}/></div></div><p className="mt-4 text-[11px] leading-5 text-white/45">Download traffic is an application estimate based on original media file size × recorded downloads during the last 30 days. Actual Supabase billed egress can differ because previews, thumbnails, video streaming, cache hits and other RAWI services also use bandwidth.</p></section>
    <BillingSettingsForm workspaceId={workspace!.id} initialDays={days}/><div className="bg-rawi-panel border border-white/[.07] rounded-[22px] p-5 md:p-6 shadow-sm"><h2 className="text-xl font-bold">Studio identity</h2><p className="text-sm text-white/45 mt-1">Upload the logo clients will see in every shared gallery.</p><div className="mt-5"><WorkspaceLogoForm workspaceId={workspace!.id} initialLogoUrl={social?.logo_url||""}/></div></div><div className="bg-rawi-panel border border-white/[.07] rounded-[22px] p-5 md:p-6 shadow-sm"><h2 className="text-xl font-bold">Social presence</h2><p className="text-sm text-white/45 mt-1">Manage the social profiles and contact link connected to this RAWI workspace.</p><div className="mt-5"><SocialLinksForm workspaceId={workspace!.id} initialLinks={initialLinks}/></div></div><ThumbnailBackfill workspaceId={workspace!.id} initialPending={optimizableImages}/></div></div>
}
function UsageMetric({icon,label,value,detail}:{icon:"storage"|"download"|"cost"|"health";label:string;value:string;detail:string}){return <div className="rounded-[18px] border border-white/[.07] bg-rawi-panel/[.04] p-4"><div className="flex items-center justify-between"><span className="text-[11px] font-bold text-white/40">{label}</span><span className="text-white/40"><MetricIcon type={icon}/></span></div><div className="mt-4 text-2xl font-extrabold tracking-[-.04em]">{value}</div><div className="mt-1 text-[10px] text-white/45">{detail}</div></div>}
