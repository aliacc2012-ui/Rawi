import { getCurrentWorkspace } from "@/lib/workspace";
import { createClient } from "@/lib/supabase/server";
import { BillingSettingsForm } from "@/components/app-shell/BillingSettingsForm";
import { SocialLinksForm } from "@/components/app-shell/SocialLinksForm";
import { ThumbnailBackfill } from "@/components/app-shell/ThumbnailBackfill";
import { WorkspaceLogoForm } from "@/components/app-shell/WorkspaceLogoForm";

type WorkspaceWithBillingSettings = { id: string; plan?: string | null; storage_used_bytes?: number | null; storage_limit_bytes?: number | null; renewal_reminder_days?: number | null };
type DownloadRow = { media_id: string; created_at: string };
type MediaRow = { id: string; file_size: number };

function gb(bytes: number) { return bytes / 1024 ** 3; }
function fmtGb(bytes: number) { const v = gb(bytes); return v < 1 ? `${Math.round(bytes / 1024 ** 2)} MB` : `${v.toFixed(v >= 100 ? 0 : 1)} GB`; }

function StorageIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>; }
function DownloadIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M12 3v12m-5-5 5 5 5-5M5 21h14"/></svg>; }
function CostIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5c-.7-1-1.8-1.5-3.4-1.5-1.8 0-3.1.9-3.1 2.3 0 3.7 6.5 1.5 6.5 5.4 0 1.4-1.3 2.3-3.3 2.3-1.6 0-2.9-.6-3.7-1.7M12 5v14"/></svg>; }
function PulseIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M3 12h4l2-6 4 12 2-6h6"/></svg>; }
function UserIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>; }
function LinkIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>; }

export default async function AdminPage() {
  const { workspace } = await getCurrentWorkspace();
  const supabase = await createClient();
  const billingWorkspace = workspace as WorkspaceWithBillingSettings;
  const days = Number(billingWorkspace?.renewal_reminder_days ?? 3);

  const [{ data: social }, { data: projectRows }] = await Promise.all([
    supabase.from("workspaces").select("logo_url,instagram_url,tiktok_url,facebook_url,website_url,whatsapp_url").eq("id", workspace!.id).single(),
    supabase.from("projects").select("id").eq("workspace_id", workspace!.id),
  ]);

  const initialLinks = { instagram: social?.instagram_url || "", tiktok: social?.tiktok_url || "", facebook: social?.facebook_url || "", website: social?.website_url || "", whatsapp: social?.whatsapp_url || "" };
  const projectIds = (projectRows ?? []).map((p) => p.id);
  let optimizableImages = 0, downloadBytes30d = 0, downloadCount30d = 0;

  if (projectIds.length) {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [{ count }, { data: mediaRows }, { data: galleryRows }] = await Promise.all([
      supabase.from("media").select("id", { count: "exact", head: true }).in("project_id", projectIds).eq("media_type", "image"),
      supabase.from("media").select("id,file_size").in("project_id", projectIds),
      supabase.from("galleries").select("id").in("project_id", projectIds),
    ]);
    optimizableImages = count ?? 0;
    const galleryIds = (galleryRows ?? []).map((g) => g.id);
    if (galleryIds.length) {
      const { data: downloadRows } = await supabase.from("downloads").select("media_id,created_at").in("gallery_id", galleryIds).gte("created_at", since);
      const sizes = new Map((mediaRows ?? [] as MediaRow[]).map((m) => [m.id, Number(m.file_size || 0)]));
      const rows = (downloadRows ?? []) as DownloadRow[];
      downloadCount30d = rows.length;
      downloadBytes30d = rows.reduce((sum, row) => sum + (sizes.get(row.media_id) || 0), 0);
    }
  }

  const used = Number(billingWorkspace.storage_used_bytes ?? 0);
  const limit = Number(billingWorkspace.storage_limit_bytes ?? 0);
  const storagePct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const estimatedCachedCostAed = gb(downloadBytes30d) * 0.03 * 3.6725;
  const estimatedOriginCostAed = gb(downloadBytes30d) * 0.09 * 3.6725;
  const storageColor = storagePct > 80 ? "#f87171" : storagePct > 60 ? "#fb923c" : "#FFD400";

  return (
    <div className="max-w-[1100px] mx-auto pb-8 relative">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-8%] left-[10%] w-[400px] h-[400px] rounded-full bg-violet-600/[.05] blur-[110px]" />
        <div className="absolute top-[40%] right-[-5%] w-[320px] h-[320px] rounded-full bg-rawi-yellow/[.04] blur-[90px]" />
        <div className="absolute bottom-[5%] left-[30%] w-[280px] h-[280px] rounded-full bg-cyan-500/[.03] blur-[80px]" />
      </div>

      {/* Page header */}
      <div className="mb-8">
        <span className="text-[11px] font-extrabold tracking-[0.18em] text-white/30">RAWI ADMIN</span>
        <h1 className="font-cormorant text-[56px] md:text-[72px] tracking-[-0.03em] leading-none mt-2 text-[#F0EFFF]">System settings</h1>
        <p className="text-white/40 mt-2 text-sm">Manage operational settings without changing code or Vercel configuration.</p>
      </div>

      <div className="space-y-5">

        {/* Infrastructure usage */}
        <section className="bg-rawi-panel border border-white/[.07] rounded-[24px] p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full bg-rawi-yellow/[.06] blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-rawi-yellow/15 text-rawi-yellow grid place-items-center">
                  <PulseIcon />
                </div>
                <h2 className="font-cormorant text-[28px] tracking-[-0.02em] text-[#F0EFFF]">Infrastructure usage</h2>
              </div>
              <p className="text-sm text-white/40">Monitor RAWI storage and estimated client download traffic before infrastructure costs become a problem.</p>
            </div>
            <span className="self-start rounded-full bg-white/[.07] border border-white/[.10] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white/50 whitespace-nowrap">
              {billingWorkspace.plan || "free"} plan
            </span>
          </div>

          {/* Metric tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <MetricTile Icon={StorageIcon} label="Storage used" value={fmtGb(used)} detail={limit ? `of ${fmtGb(limit)}` : ""} color="text-violet-400" bg="bg-violet-500/10" />
            <MetricTile Icon={DownloadIcon} label="Downloads · 30d" value={String(downloadCount30d)} detail={`${fmtGb(downloadBytes30d)} estimated traffic`} color="text-cyan-400" bg="bg-cyan-500/10" />
            <MetricTile Icon={CostIcon} label="Cached estimate" value={`AED ${estimatedCachedCostAed.toFixed(2)}`} detail="at $0.03 / GB" color="text-emerald-400" bg="bg-emerald-500/10" />
            <MetricTile Icon={CostIcon} label="Origin estimate" value={`AED ${estimatedOriginCostAed.toFixed(2)}`} detail="at $0.09 / GB" color="text-amber-400" bg="bg-amber-500/10" />
          </div>

          {/* Storage bar */}
          <div className="rounded-[16px] bg-white/[.03] border border-white/[.06] p-4">
            <div className="flex justify-between text-xs font-bold mb-3 text-white/50">
              <span>Workspace storage</span>
              <span style={{ color: storageColor }}>{storagePct.toFixed(1)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/[.06] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${storagePct}%`, backgroundColor: storageColor }} />
            </div>
            <div className="flex justify-between text-[10px] text-white/30 mt-2">
              <span>{fmtGb(used)} used</span>
              <span>{fmtGb(limit)} total</span>
            </div>
          </div>

          <p className="mt-4 text-[11px] leading-5 text-white/30">
            Download traffic is an application estimate based on original media file size × recorded downloads during the last 30 days. Actual Supabase billed egress can differ because previews, thumbnails, video streaming, cache hits and other RAWI services also use bandwidth.
          </p>
        </section>

        {/* Billing settings */}
        <section className="bg-rawi-panel border border-white/[.07] rounded-[24px] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-rawi-yellow/15 text-rawi-yellow grid place-items-center">
              <CostIcon />
            </div>
            <h2 className="font-cormorant text-[28px] tracking-[-0.02em] text-[#F0EFFF]">Billing settings</h2>
          </div>
          <p className="text-sm text-white/40 mb-5">Control when Creator and Pro customers see their renewal reminder.</p>
          <BillingSettingsForm workspaceId={workspace!.id} initialDays={days} />
        </section>

        {/* Studio identity */}
        <section className="bg-rawi-panel border border-white/[.07] rounded-[24px] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 grid place-items-center">
              <UserIcon />
            </div>
            <h2 className="font-cormorant text-[28px] tracking-[-0.02em] text-[#F0EFFF]">Studio identity</h2>
          </div>
          <p className="text-sm text-white/40 mb-5">Upload the logo clients will see in every shared gallery.</p>
          <WorkspaceLogoForm workspaceId={workspace!.id} initialLogoUrl={social?.logo_url || ""} />
        </section>

        {/* Social presence */}
        <section className="bg-rawi-panel border border-white/[.07] rounded-[24px] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 grid place-items-center">
              <LinkIcon />
            </div>
            <h2 className="font-cormorant text-[28px] tracking-[-0.02em] text-[#F0EFFF]">Social presence</h2>
          </div>
          <p className="text-sm text-white/40 mb-5">Manage the social profiles and contact link connected to this RAWI workspace.</p>
          <SocialLinksForm workspaceId={workspace!.id} initialLinks={initialLinks} />
        </section>

        <ThumbnailBackfill workspaceId={workspace!.id} initialPending={optimizableImages} />
      </div>
    </div>
  );
}

function MetricTile({ Icon, label, value, detail, color, bg }: {
  Icon: () => JSX.Element; label: string; value: string; detail: string; color: string; bg: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/[.07] bg-[#0C0C1A] p-4 hover:border-white/[.12] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-bold text-white/35">{label}</span>
        <div className={`w-8 h-8 rounded-xl grid place-items-center ${bg} ${color}`}>
          <Icon />
        </div>
      </div>
      <div className="font-cormorant text-[32px] leading-none font-bold tracking-[-0.03em] text-[#F0EFFF]">{value}</div>
      <div className="mt-1.5 text-[10px] text-white/35">{detail}</div>
    </div>
  );
}
