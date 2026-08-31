import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { AnalyticsView } from "@/components/app-shell/AnalyticsView";

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

  const byGallery = galleries
    .map((gallery) => ({
      id: gallery.id,
      title: gallery.title,
      views: viewsRows.filter((r) => r.gallery_id === gallery.id).length,
      downloads: downloadsRows.filter((r) => r.gallery_id === gallery.id).length,
      favorites: favoritesRows.filter((r) => r.gallery_id === gallery.id).length,
    }))
    .sort((a, b) => (b.views + b.downloads + b.favorites) - (a.views + a.downloads + a.favorites));

  return (
    <AnalyticsView
      plan={workspace!.plan.toUpperCase()}
      views={views}
      downloads={downloads}
      favorites={favorites}
      published={published}
      engagement={engagement}
      byGallery={byGallery}
      totalGalleries={galleries.length}
      paidAnalytics={paidAnalytics}
    />
  );
}
