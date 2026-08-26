import { createAdminClient } from "@/lib/supabase/admin";
import { hasGalleryAccess } from "@/app/g/[slug]/actions";
import { PasswordGate } from "@/components/gallery/PasswordGate";
import { GalleryMediaGrid } from "@/components/gallery/GalleryMediaGrid";

export const dynamic = "force-dynamic";

export default async function ClientGalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data: gallery } = await admin.from("galleries").select("*, projects(name, project_type, workspaces(name, logo_url))").eq("slug", slug).single();

  if (!gallery) return <UnavailableScreen reason="This gallery doesn't exist or the link is wrong." />;
  if (gallery.status !== "published") return <UnavailableScreen reason="This gallery isn't published yet." />;
  if (gallery.expiry_date && new Date(gallery.expiry_date) < new Date()) return <UnavailableScreen reason="This gallery's delivery window has ended." />;

  if (gallery.password_enabled) {
    const hasAccess = await hasGalleryAccess(gallery.id);
    if (!hasAccess) return <PasswordGate galleryId={gallery.id} title={gallery.title} />;
  }

  const { data: sections } = await admin.from("gallery_sections").select("*, media(id, media_type, sort_order)").eq("gallery_id", gallery.id).order("sort_order", { ascending: true });

  const project = gallery.projects as unknown as { name: string; project_type: string; workspaces: { name: string; logo_url: string | null } | null } | null;
  const studioName = project?.workspaces?.name ?? "RAWI";
  const typedSections = (sections ?? []).map((section) => ({
    id: section.id as string,
    title: section.title as string,
    media: ((section.media as unknown as { id: string; media_type: "image" | "video" | "raw"; sort_order?: number }[]) ?? []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
  }));
  const hasMedia = typedSections.some((section) => section.media.length > 0);

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <div className="relative min-h-[60vh] flex flex-col justify-between p-6 md:p-10 bg-[linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.75)),radial-gradient(circle_at_60%_50%,rgba(255,212,0,.18),transparent_26%),linear-gradient(145deg,#3b3b3b,#080808_55%,#292929)]">
        <div className="flex items-center justify-between text-gray-300 text-xs">
          <span className="font-bold">{studioName}</span>
          {gallery.branding_enabled && <span className="text-gray-500">Delivered with RAWI</span>}
        </div>
        <div>
          <span className="text-[10px] tracking-[0.2em] text-gray-300 block mb-2">{project?.project_type?.toUpperCase().replace("_", " + ")}</span>
          <h1 className="text-[40px] md:text-[64px] tracking-[-0.06em] leading-none">{gallery.title}</h1>
          {gallery.description && <p className="text-gray-400 mt-3 max-w-lg">{gallery.description}</p>}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-5 md:p-10">
        {hasMedia ? (
          <GalleryMediaGrid galleryId={gallery.id} sections={typedSections} favoritesEnabled={gallery.favorites_enabled} downloadsEnabled={gallery.downloads_enabled} />
        ) : (
          <div className="text-center py-24 text-gray-500">This gallery is published but doesn&rsquo;t have any media yet — check back soon.</div>
        )}
      </div>
    </div>
  );
}

function UnavailableScreen({ reason }: { reason: string }) {
  return (
    <div className="min-h-screen bg-[#090909] text-white grid place-items-center p-6">
      <div className="max-w-sm text-center">
        <span className="inline-grid w-10 h-10 rounded-[50%_50%_50%_8px] bg-rawi-yellow place-items-center text-black font-black -rotate-[8deg] mb-6">R</span>
        <h1 className="text-2xl font-extrabold tracking-[-0.02em]">Gallery unavailable</h1>
        <p className="text-gray-400 mt-3 leading-relaxed">{reason}</p>
      </div>
    </div>
  );
}
