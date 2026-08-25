import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function AnalyticsPage() {
  const { workspace } = await getCurrentWorkspace();
  const supabase = await createClient();

  const { data: projectIds } = await supabase
    .from("projects")
    .select("id")
    .eq("workspace_id", workspace!.id);

  const ids = (projectIds ?? []).map((p) => p.id);

  let galleryIds: string[] = [];
  if (ids.length > 0) {
    const { data: galleries } = await supabase.from("galleries").select("id").in("project_id", ids);
    galleryIds = (galleries ?? []).map((g) => g.id);
  }

  let views = 0;
  let downloads = 0;
  let favorites = 0;

  if (galleryIds.length > 0) {
    const [viewsRes, downloadsRes, favoritesRes] = await Promise.all([
      supabase.from("gallery_views").select("id", { count: "exact", head: true }).in("gallery_id", galleryIds),
      supabase.from("downloads").select("id", { count: "exact", head: true }).in("gallery_id", galleryIds),
      supabase.from("favorites").select("id", { count: "exact", head: true }).in("gallery_id", galleryIds),
    ]);
    views = viewsRes.count ?? 0;
    downloads = downloadsRes.count ?? 0;
    favorites = favoritesRes.count ?? 0;
  }

  const hasActivity = views + downloads + favorites > 0;

  return (
    <div>
      <div className="mb-8">
        <span className="text-[11px] font-extrabold tracking-[0.17em] text-gray-400">CREATOR WORKSPACE</span>
        <h1 className="text-[28px] md:text-[34px] tracking-[-0.04em] mt-1.5">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4">
        <Stat label="Gallery views" value={String(views)} />
        <Stat label="Downloads" value={String(downloads)} />
        <Stat label="Favorites" value={String(favorites)} />
      </div>

      {!hasActivity && (
        <div className="bg-white border border-dashed border-gray-300 rounded-[20px] py-16 text-center text-gray-500 text-sm">
          No activity yet. Once you publish a gallery and share it with a client, views, downloads and
          favorites will show up here.
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-[20px] p-5.5 flex flex-col gap-1.5">
      <span className="text-[11px] text-gray-400">{label}</span>
      <strong className="text-[34px] tracking-[-0.05em]">{value}</strong>
    </div>
  );
}
