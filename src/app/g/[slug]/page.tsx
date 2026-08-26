import { createAdminClient } from "@/lib/supabase/admin";
import { hasGalleryAccess } from "@/app/g/[slug]/actions";
import { PasswordGate } from "@/components/gallery/PasswordGate";
import { GalleryMediaGrid } from "@/components/gallery/GalleryMediaGrid";

export const dynamic = "force-dynamic";

export default async function ClientGalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data: gallery } = await admin
    .from("galleries")
    .select("*, projects(name, project_type, project_date, workspaces(name, logo_url))")
    .eq("slug", slug)
    .single();

  if (!gallery) return <UnavailableScreen reason="This gallery doesn't exist or the link is wrong." />;
  if (gallery.status !== "published") return <UnavailableScreen reason="This gallery isn't published yet." />;
  if (gallery.expiry_date && new Date(gallery.expiry_date) < new Date()) {
    return <UnavailableScreen reason="This gallery's delivery window has ended." />;
  }

  if (gallery.password_enabled) {
    const hasAccess = await hasGalleryAccess(gallery.id);
    if (!hasAccess) return <PasswordGate galleryId={gallery.id} title={gallery.title} />;
  }

  const { data: sections } = await admin
    .from("gallery_sections")
    .select("*, media(id, media_type, sort_order, storage_path)")
    .eq("gallery_id", gallery.id)
    .order("sort_order", { ascending: true });

  const project = gallery.projects as unknown as {
    name: string;
    project_type: string;
    project_date: string | null;
    workspaces: { name: string; logo_url: string | null } | null;
  } | null;

  const studioName = project?.workspaces?.name ?? "RAWI";
  const typedSections = (sections ?? []).map((section) => ({
    id: section.id as string,
    title: section.title as string,
    media: ((section.media as unknown as {
      id: string;
      media_type: "image" | "video" | "raw";
      sort_order?: number;
      storage_path?: string;
    }[]) ?? []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
  }));

  const allMedia = typedSections.flatMap((section) => section.media);
  const hasMedia = allMedia.length > 0;
  const photoCount = allMedia.filter((item) => item.media_type === "image").length;
  const videoCount = allMedia.filter((item) => item.media_type === "video").length;
  const coverMedia = allMedia.find((item) => item.media_type === "image" && item.storage_path);

  let coverUrl: string | null = null;
  if (coverMedia?.storage_path) {
    const { data } = await admin.storage.from("media").createSignedUrl(coverMedia.storage_path, 60 * 10);
    coverUrl = data?.signedUrl ?? null;
  }

  const projectDate = project?.project_date
    ? new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(project.project_date))
    : null;

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <section
        className="relative min-h-[78vh] overflow-hidden bg-[#0a0a0a] text-white"
        style={coverUrl ? { backgroundImage: `url(${coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.88)_0%,rgba(0,0,0,.68)_38%,rgba(0,0,0,.20)_72%,rgba(0,0,0,.42)_100%)]" />
        {!coverUrl && <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(255,212,0,.14),transparent_30%),linear-gradient(145deg,#242424,#080808_58%,#171717)]" />}

        <div className="relative z-10 flex min-h-[78vh] flex-col px-6 py-6 md:px-10 md:py-8 lg:px-14">
          <header className="flex items-center justify-between text-sm">
            <span className="font-extrabold tracking-[0.08em]">{studioName}</span>
            <div className="flex items-center gap-4 text-white/70">
              {gallery.branding_enabled && <span className="hidden sm:inline text-xs">Delivered with RAWI</span>}
              <span className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/20">♡</span>
              <span className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/20">↓</span>
            </div>
          </header>

          <div className="my-auto max-w-xl py-16">
            <span className="mb-4 block text-[11px] font-extrabold tracking-[0.18em] text-[#FFD400]">
              {project?.project_type?.toUpperCase().replace("_", " + ") || "GALLERY"}
            </span>
            <h1 className="max-w-[680px] text-[48px] font-semibold leading-[0.92] tracking-[-0.055em] sm:text-[64px] lg:text-[78px]">
              {gallery.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/75">
              {projectDate && <span>{projectDate}</span>}
              {projectDate && <span className="text-white/30">•</span>}
              <span>{studioName}</span>
            </div>

            {gallery.description && (
              <p className="mt-7 max-w-md text-[15px] leading-7 text-white/70">{gallery.description}</p>
            )}

            <div className="mt-7 flex flex-wrap gap-5 text-sm text-white/80">
              <span>▣ {photoCount} Photo{photoCount === 1 ? "" : "s"}</span>
              {videoCount > 0 && <span>▻ {videoCount} Video{videoCount === 1 ? "" : "s"}</span>}
            </div>

            <a
              href="#gallery"
              className="mt-8 inline-flex items-center gap-4 rounded-lg border border-white/35 bg-black/20 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-white hover:bg-white hover:text-black"
            >
              View Gallery <span>→</span>
            </a>
          </div>

          <a href="#gallery" className="mx-auto mb-1 flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/55">
            <span>⌄</span>
            <span>Scroll to explore</span>
          </a>
        </div>
      </section>

      <section id="gallery" className="scroll-mt-0 bg-[#f6f5f2]">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
          <div className="mb-8 flex flex-col justify-between gap-4 border-b border-black/10 pb-6 sm:flex-row sm:items-end">
            <div>
              <span className="text-[10px] font-extrabold tracking-[0.16em] text-[#b59600]">CURATED DELIVERY</span>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">{gallery.title}</h2>
            </div>
            <div className="text-sm text-black/45">{allMedia.length} item{allMedia.length === 1 ? "" : "s"}</div>
          </div>

          {hasMedia ? (
            <GalleryMediaGrid
              galleryId={gallery.id}
              sections={typedSections}
              favoritesEnabled={gallery.favorites_enabled}
              downloadsEnabled={gallery.downloads_enabled}
              theme="light"
            />
          ) : (
            <div className="py-24 text-center text-black/40">This gallery is published but doesn&rsquo;t have any media yet — check back soon.</div>
          )}
        </div>
      </section>

      <footer className="border-t border-black/10 bg-white px-6 py-8 text-center text-xs text-black/40">
        {gallery.branding_enabled ? "Made with RAWI" : studioName}
      </footer>
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
