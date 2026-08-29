import { createAdminClient } from "@/lib/supabase/admin";
import { hasGalleryAccess, getVisitorComments } from "@/app/g/[slug]/actions";
import { PasswordGate } from "@/components/gallery/PasswordGate";
import { GalleryMediaGrid } from "@/components/gallery/GalleryMediaGrid";
import { ClientComments } from "@/components/gallery/ClientComments";
export const dynamic = "force-dynamic";
type GalleryTheme = "clean" | "dark" | "editorial";
export default async function ClientGalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data: gallery } = await admin
    .from("galleries")
    .select(
      "*,projects(name,project_type,project_date,workspaces(name,logo_url,plan,instagram_url,tiktok_url,facebook_url,website_url))",
    )
    .eq("slug", slug)
    .single();
  if (!gallery)
    return (
      <UnavailableScreen reason="This gallery doesn't exist or the link is wrong." />
    );
  if (gallery.status !== "published")
    return <UnavailableScreen reason="This gallery isn't published yet." />;
  if (gallery.expiry_date && new Date(gallery.expiry_date) < new Date())
    return (
      <UnavailableScreen reason="This gallery's delivery window has ended." />
    );
  if (gallery.password_enabled) {
    if (!gallery.password_hash)
      return (
        <UnavailableScreen reason="This gallery password is unavailable." />
      );
    const hasAccess = await hasGalleryAccess(gallery.id, gallery.password_hash);
    if (!hasAccess)
      return <PasswordGate galleryId={gallery.id} title={gallery.title} />;
  }
  const { data: sections } = await admin
    .from("gallery_sections")
    .select("*,media(id,media_type,sort_order,storage_path,thumbnail_path)")
    .eq("gallery_id", gallery.id)
    .order("sort_order", { ascending: true });
  const project = gallery.projects as unknown as {
    name: string;
    project_type: string;
    project_date: string | null;
    workspaces: {
      name: string;
      logo_url: string | null;
      plan: string;
      instagram_url: string | null;
      tiktok_url: string | null;
      facebook_url: string | null;
      website_url: string | null;
    } | null;
  } | null;
  const studioName = project?.workspaces?.name ?? "RAWI";
  const plan = project?.workspaces?.plan ?? "free";
  const socialLinks = [
    { label: "Instagram", url: project?.workspaces?.instagram_url },
    { label: "TikTok", url: project?.workspaces?.tiktok_url },
    { label: "Facebook", url: project?.workspaces?.facebook_url },
    { label: "Website", url: project?.workspaces?.website_url },
  ].filter((item): item is { label: string; url: string } => Boolean(item.url));
  const commentsAllowed =
    (plan === "creator" || plan === "pro" || plan === "studio") &&
    gallery.comments_enabled;
  const typedSections = (sections ?? []).map((section) => ({
    id: section.id as string,
    title: section.title as string,
    media: (
      (section.media as unknown as {
        id: string;
        media_type: "image" | "video" | "raw";
        sort_order?: number;
        storage_path?: string;
        thumbnail_path?: string | null;
        signed_url?: string | null;
        thumbnail_url?: string | null;
      }[]) ?? []
    ).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
  }));
  const allMedia = typedSections.flatMap((section) => section.media);
  const previewPaths = Array.from(
    new Set(
      allMedia
        .map((item) => item.thumbnail_path ?? item.storage_path)
        .filter(Boolean) as string[],
    ),
  );
  const signedByPath = new Map<string, string>();
  if (previewPaths.length) {
    const { data: signed } = await admin.storage
      .from("media")
      .createSignedUrls(previewPaths, 60 * 10);
    for (const item of signed ?? []) {
      if (item.path && item.signedUrl)
        signedByPath.set(item.path, item.signedUrl);
    }
  }
  for (const section of typedSections)
    for (const item of section.media) {
      const previewPath = item.thumbnail_path ?? item.storage_path;
      if (previewPath)
        item.thumbnail_url = signedByPath.get(previewPath) ?? null;
    }
  const hasMedia = allMedia.length > 0;
  const photoCount = allMedia.filter(
    (item) => item.media_type === "image",
  ).length;
  const videoCount = allMedia.filter(
    (item) => item.media_type === "video",
  ).length;
  const coverMedia = allMedia.find(
    (item) => item.media_type === "image" && item.thumbnail_url,
  );
  const coverUrl = coverMedia?.thumbnail_url ?? null;
  const comments = commentsAllowed ? await getVisitorComments(gallery.id) : [];
  const projectDate = project?.project_date
    ? new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(project.project_date))
    : null;
  const galleryTheme = ((gallery as unknown as { theme?: GalleryTheme })
    .theme ?? "clean") as GalleryTheme;
  const dark = galleryTheme === "dark";
  const editorial = galleryTheme === "editorial";
  const pageClass = dark
    ? "bg-[#080808] text-white"
    : editorial
      ? "bg-[#eee9df] text-[#201d19]"
      : "bg-white text-[#111]";
  const gallerySectionClass = dark
    ? "bg-[#0b0b0b]"
    : editorial
      ? "bg-[#eee9df]"
      : "bg-[#f6f5f2]";
  const contentWidth = editorial ? "max-w-7xl" : "max-w-6xl";
  const borderClass = dark ? "border-white/10" : "border-black/10";
  const mutedClass = dark ? "text-white/45" : "text-black/40";
  return (
    <div className={`min-h-screen ${pageClass}`}>
      <section
        className={`relative overflow-hidden text-white ${editorial ? "min-h-[70vh]" : "min-h-[78vh]"}`}
        style={
          coverUrl
            ? {
                backgroundImage: `url(${coverUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div
          className={`absolute inset-0 ${editorial ? "bg-[linear-gradient(90deg,rgba(20,16,12,.72)_0%,rgba(20,16,12,.40)_45%,rgba(20,16,12,.12)_100%)]" : "bg-[linear-gradient(90deg,rgba(0,0,0,.88)_0%,rgba(0,0,0,.68)_38%,rgba(0,0,0,.20)_72%,rgba(0,0,0,.42)_100%)]"}`}
        />
        {!coverUrl && (
          <div
            className={`absolute inset-0 ${editorial ? "bg-[linear-gradient(145deg,#554a3f,#201c18_58%,#796957)]" : "bg-[radial-gradient(circle_at_70%_40%,rgba(255,212,0,.14),transparent_30%),linear-gradient(145deg,#242424,#080808_58%,#171717)]"}`}
          />
        )}
        <div
          className={`relative z-10 flex flex-col px-6 py-6 md:px-10 md:py-8 lg:px-14 ${editorial ? "min-h-[70vh]" : "min-h-[78vh]"}`}
        >
          <header className="flex items-center justify-between text-sm">
            <span className="font-extrabold tracking-[0.08em]">
              {studioName}
            </span>
            <div className="flex items-center gap-3 text-white/70">
              {socialLinks.length > 0 && (
                <nav
                  aria-label={`${studioName} social media`}
                  className="flex items-center gap-1 sm:gap-2"
                >
                  {socialLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.label}
                      title={item.label}
                      className="grid h-8 w-8 place-items-center rounded-full border border-white/20 text-white/75 transition hover:-translate-y-0.5 hover:border-white/45 hover:text-white sm:h-9 sm:w-9"
                    >
                      <SocialIcon label={item.label} />
                    </a>
                  ))}
                </nav>
              )}
              {gallery.branding_enabled && (
                <span className="hidden sm:inline text-xs">
                  Delivered with RAWI
                </span>
              )}
              {gallery.favorites_enabled && (
                <span className="grid h-9 w-9 place-items-center rounded-full border border-white/20">
                  ♡
                </span>
              )}
              {gallery.downloads_enabled && (
                <span className="grid h-9 w-9 place-items-center rounded-full border border-white/20">
                  ↓
                </span>
              )}
            </div>
          </header>
          <div
            className={`my-auto py-16 ${editorial ? "mx-auto w-full max-w-4xl text-center" : "max-w-xl"}`}
          >
            <span
              className={`mb-4 block text-[11px] font-extrabold tracking-[.18em] ${editorial ? "text-[#f3dfaa]" : "text-[#FFD400]"}`}
            >
              {project?.project_type?.toUpperCase().replace("_", " + ") ||
                "GALLERY"}
            </span>
            <h1
              className={`${editorial ? "font-serif text-[50px] leading-[1] sm:text-[70px] lg:text-[86px]" : "text-[48px] font-semibold leading-[.92] tracking-[-.055em] sm:text-[64px] lg:text-[78px]"}`}
            >
              {gallery.title}
            </h1>
            <div
              className={`mt-5 flex flex-wrap gap-3 text-sm text-white/75 ${editorial ? "justify-center" : ""}`}
            >
              {projectDate && <span>{projectDate}</span>}
              <span>{studioName}</span>
            </div>
            {gallery.description && (
              <p
                className={`mt-7 text-[15px] leading-7 text-white/70 ${editorial ? "mx-auto max-w-xl" : "max-w-md"}`}
              >
                {gallery.description}
              </p>
            )}
            <div
              className={`mt-7 flex gap-5 text-sm text-white/80 ${editorial ? "justify-center" : ""}`}
            >
              <span>▣ {photoCount} Photos</span>
              {videoCount > 0 && <span>▻ {videoCount} Videos</span>}
            </div>
            <a
              href="#gallery"
              className="mt-8 inline-flex rounded-lg border border-white/35 px-5 py-3 text-sm font-semibold"
            >
              View Gallery →
            </a>
          </div>
        </div>
      </section>
      <section id="gallery" className={gallerySectionClass}>
        <div
          className={`mx-auto ${contentWidth} px-5 ${editorial ? "py-16 md:py-24" : "py-10"}`}
        >
          <div
            className={`mb-8 border-b pb-6 ${borderClass} ${editorial ? "text-center" : ""}`}
          >
            <span
              className={`text-[10px] font-extrabold tracking-[.16em] ${dark ? "text-[#FFD400]" : editorial ? "text-[#8a7151]" : "text-[#b59600]"}`}
            >
              CURATED DELIVERY
            </span>
            <h2
              className={`mt-2 ${editorial ? "font-serif text-4xl md:text-5xl" : "text-3xl font-semibold tracking-[-.04em]"}`}
            >
              {gallery.title}
            </h2>
          </div>
          {hasMedia ? (
            <GalleryMediaGrid
              galleryId={gallery.id}
              sections={typedSections}
              favoritesEnabled={gallery.favorites_enabled}
              downloadsEnabled={gallery.downloads_enabled}
              commentsEnabled={commentsAllowed}
              theme={dark ? "dark" : "light"}
            />
          ) : (
            <div className={`py-24 text-center ${mutedClass}`}>
              This gallery is published but doesn&rsquo;t have any media yet.
            </div>
          )}
        </div>
      </section>
      {commentsAllowed && (
        <ClientComments galleryId={gallery.id} initialComments={comments} />
      )}
      <footer
        className={`border-t px-6 py-8 text-center text-xs ${borderClass} ${dark ? "bg-[#080808] text-white/35" : editorial ? "bg-[#e7e0d4] text-black/40" : "bg-white text-black/40"}`}
      >
        {gallery.branding_enabled ? "Made with RAWI" : studioName}
      </footer>
    </div>
  );
}
function SocialIcon({ label }: { label: string }) {
  if (label === "Instagram")
    return (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  if (label === "TikTok")
    return (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
        <path d="M15.6 3c.3 2.1 1.5 3.5 3.6 3.9v3.2a8.1 8.1 0 0 1-3.6-1.1v6.3a6.3 6.3 0 1 1-5.5-6.2v3.3a3.1 3.1 0 1 0 2.3 3V3h3.2Z" />
      </svg>
    );
  if (label === "Facebook")
    return (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
        <path d="M13.7 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5H17V3.6c-.8-.1-1.6-.2-2.4-.2-2.4 0-4.1 1.5-4.1 4.2v2.3H7.8V13h2.7v8h3.2Z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 12h17M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21M12 3c-2.3 2.5-3.5 5.5-3.5 9S9.7 18.5 12 21" />
    </svg>
  );
}
function UnavailableScreen({ reason }: { reason: string }) {
  return (
    <div className="min-h-screen bg-[#090909] text-white grid place-items-center p-6">
      <div className="max-w-sm text-center">
        <span className="inline-grid w-10 h-10 rounded-[50%_50%_50%_8px] bg-rawi-yellow place-items-center text-black font-black -rotate-[8deg] mb-6">
          R
        </span>
        <h1 className="text-2xl font-extrabold">Gallery unavailable</h1>
        <p className="text-gray-400 mt-3">{reason}</p>
      </div>
    </div>
  );
}
