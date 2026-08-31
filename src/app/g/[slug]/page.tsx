import { createAdminClient } from "@/lib/supabase/admin";
import { hasGalleryAccess, getVisitorComments } from "@/app/g/[slug]/actions";
import { PasswordGate } from "@/components/gallery/PasswordGate";
import { GalleryMediaGrid } from "@/components/gallery/GalleryMediaGrid";
import { ClientComments } from "@/components/gallery/ClientComments";
import Image from "next/image";
export const dynamic = "force-dynamic";

type GalleryTheme =
  | "clean" | "dark" | "editorial"
  | "noir" | "blush" | "forest" | "slate" | "ivory" | "midnight" | "ember";

// ── Per-theme layout config ────────────────────────────────────────────────
const THEME: Record<GalleryTheme, {
  page: string;          // body bg + text
  heroHeight: string;    // hero min-height
  heroOverlay: string;   // gradient overlay on cover image
  heroFallback: string;  // gradient when no cover
  align: "left" | "center";
  serif: boolean;        // heading font
  accent: string;        // eyebrow / label color
  galleryBg: string;     // media section bg
  gallerySectionPad: string;
  contentWidth: string;
  border: string;
  muted: string;
  footerBg: string;
  cta: string;           // "View Gallery" button classes
}> = {
  // 1. Clean — bright, airy, left-aligned
  clean: {
    page: "bg-white text-[#111]",
    heroHeight: "min-h-[78vh]",
    heroOverlay: "bg-[linear-gradient(90deg,rgba(0,0,0,.88)_0%,rgba(0,0,0,.60)_38%,rgba(0,0,0,.18)_72%,rgba(0,0,0,.30)_100%)]",
    heroFallback: "bg-[radial-gradient(circle_at_70%_40%,rgba(255,212,0,.12),transparent_30%),linear-gradient(145deg,#242424,#080808_58%,#171717)]",
    align: "left",
    serif: false,
    accent: "#FFD400",
    galleryBg: "bg-[#f6f5f2]",
    gallerySectionPad: "py-10",
    contentWidth: "max-w-6xl",
    border: "border-black/10",
    muted: "text-black/40",
    footerBg: "bg-white text-black/40",
    cta: "border border-white/35 rounded-lg px-5 py-3 text-sm font-semibold",
  },

  // 2. Dark — cinematic black, bold
  dark: {
    page: "bg-[#080808] text-white",
    heroHeight: "min-h-[82vh]",
    heroOverlay: "bg-[linear-gradient(90deg,rgba(0,0,0,.92)_0%,rgba(0,0,0,.70)_40%,rgba(0,0,0,.22)_100%)]",
    heroFallback: "bg-[radial-gradient(circle_at_70%_40%,rgba(255,212,0,.16),transparent_32%),linear-gradient(145deg,#1a1a1a,#050505_58%,#111)]",
    align: "left",
    serif: false,
    accent: "#FFD400",
    galleryBg: "bg-[#0b0b0b]",
    gallerySectionPad: "py-12",
    contentWidth: "max-w-6xl",
    border: "border-white/10",
    muted: "text-white/40",
    footerBg: "bg-[#080808] text-white/35",
    cta: "border border-white/35 rounded-lg px-5 py-3 text-sm font-semibold",
  },

  // 3. Editorial — warm beige, centered, serif, magazine
  editorial: {
    page: "bg-[#eee9df] text-[#201d19]",
    heroHeight: "min-h-[70vh]",
    heroOverlay: "bg-[linear-gradient(90deg,rgba(20,16,12,.72)_0%,rgba(20,16,12,.40)_45%,rgba(20,16,12,.12)_100%)]",
    heroFallback: "bg-[linear-gradient(145deg,#554a3f,#201c18_58%,#796957)]",
    align: "center",
    serif: true,
    accent: "#f3dfaa",
    galleryBg: "bg-[#eee9df]",
    gallerySectionPad: "py-16 md:py-24",
    contentWidth: "max-w-7xl",
    border: "border-black/10",
    muted: "text-black/40",
    footerBg: "bg-[#e7e0d4] text-black/40",
    cta: "border border-white/35 rounded-full px-7 py-3 text-sm font-semibold tracking-wide",
  },

  // 4. Noir — deep charcoal, precise, silver accents, full-bleed feel
  noir: {
    page: "bg-[#111115] text-[#dddde8]",
    heroHeight: "min-h-[88vh]",
    heroOverlay: "bg-[linear-gradient(135deg,rgba(8,8,12,.94)_0%,rgba(8,8,12,.55)_55%,rgba(8,8,12,.75)_100%)]",
    heroFallback: "bg-[radial-gradient(ellipse_at_20%_60%,rgba(160,160,200,.10),transparent_45%),linear-gradient(160deg,#1a1a22,#0a0a10_60%,#14141c)]",
    align: "left",
    serif: false,
    accent: "#a0a0c8",
    galleryBg: "bg-[#0e0e14]",
    gallerySectionPad: "py-16 md:py-20",
    contentWidth: "max-w-7xl",
    border: "border-white/[.08]",
    muted: "text-white/35",
    footerBg: "bg-[#0a0a10] text-white/25",
    cta: "border border-white/20 rounded px-6 py-3 text-sm font-medium tracking-[.08em] uppercase",
  },

  // 5. Blush — pink-cream, romantic, center-aligned, serif
  blush: {
    page: "bg-[#fdf5f6] text-[#3a1e25]",
    heroHeight: "min-h-[65vh]",
    heroOverlay: "bg-[linear-gradient(180deg,rgba(30,8,16,.70)_0%,rgba(30,8,16,.38)_50%,rgba(30,8,16,.60)_100%)]",
    heroFallback: "bg-[radial-gradient(ellipse_at_50%_30%,rgba(200,100,120,.22),transparent_55%),linear-gradient(145deg,#3a1020,#1a0810_60%,#2a1018)]",
    align: "center",
    serif: true,
    accent: "#f0a0b0",
    galleryBg: "bg-[#faf0f2]",
    gallerySectionPad: "py-14 md:py-20",
    contentWidth: "max-w-6xl",
    border: "border-rose-200/60",
    muted: "text-rose-900/40",
    footerBg: "bg-[#f5e8ec] text-rose-900/35",
    cta: "border border-white/40 rounded-full px-8 py-3 text-sm font-medium italic",
  },

  // 6. Forest — dark green, organic, full-bleed
  forest: {
    page: "bg-[#111a14] text-[#c8ddc8]",
    heroHeight: "min-h-[85vh]",
    heroOverlay: "bg-[linear-gradient(120deg,rgba(6,14,8,.90)_0%,rgba(6,14,8,.52)_50%,rgba(6,14,8,.70)_100%)]",
    heroFallback: "bg-[radial-gradient(ellipse_at_75%_25%,rgba(60,140,70,.18),transparent_45%),linear-gradient(145deg,#0e1a10,#060e08_60%,#121a0e)]",
    align: "left",
    serif: false,
    accent: "#7acc88",
    galleryBg: "bg-[#0d1510]",
    gallerySectionPad: "py-14 md:py-20",
    contentWidth: "max-w-6xl",
    border: "border-green-900/40",
    muted: "text-green-300/35",
    footerBg: "bg-[#0a1208] text-green-200/25",
    cta: "border border-green-400/30 rounded px-6 py-3 text-sm font-semibold",
  },

  // 7. Slate — cool blue-gray, architectural, structured
  slate: {
    page: "bg-[#e8ecf0] text-[#1e2a36]",
    heroHeight: "min-h-[72vh]",
    heroOverlay: "bg-[linear-gradient(110deg,rgba(14,22,32,.88)_0%,rgba(14,22,32,.55)_48%,rgba(14,22,32,.30)_100%)]",
    heroFallback: "bg-[radial-gradient(ellipse_at_30%_70%,rgba(50,90,140,.20),transparent_50%),linear-gradient(145deg,#1e2e40,#0e1820_60%,#182436)]",
    align: "left",
    serif: false,
    accent: "#78a8d0",
    galleryBg: "bg-[#dde4ec]",
    gallerySectionPad: "py-12 md:py-16",
    contentWidth: "max-w-6xl",
    border: "border-slate-300/60",
    muted: "text-slate-500/60",
    footerBg: "bg-[#d4dce6] text-slate-500/50",
    cta: "border border-white/35 rounded px-5 py-3 text-sm font-semibold tracking-wide",
  },

  // 8. Ivory — cream, luxury, centered, wide margins, serif
  ivory: {
    page: "bg-[#faf7f0] text-[#2e2820]",
    heroHeight: "min-h-[68vh]",
    heroOverlay: "bg-[linear-gradient(180deg,rgba(18,14,10,.78)_0%,rgba(18,14,10,.42)_52%,rgba(18,14,10,.68)_100%)]",
    heroFallback: "bg-[radial-gradient(ellipse_at_50%_40%,rgba(160,120,60,.18),transparent_55%),linear-gradient(145deg,#2e2018,#181008_60%,#241c10)]",
    align: "center",
    serif: true,
    accent: "#c8a860",
    galleryBg: "bg-[#f4f0e6]",
    gallerySectionPad: "py-20 md:py-28",
    contentWidth: "max-w-5xl",
    border: "border-amber-200/50",
    muted: "text-amber-900/35",
    footerBg: "bg-[#ede8da] text-amber-900/30",
    cta: "border border-white/40 rounded-full px-10 py-3.5 text-sm font-medium tracking-[.12em] uppercase",
  },

  // 9. Midnight — deep navy, celestial, dramatic
  midnight: {
    page: "bg-[#08091a] text-[#c8cce8]",
    heroHeight: "min-h-[86vh]",
    heroOverlay: "bg-[linear-gradient(135deg,rgba(4,6,20,.95)_0%,rgba(4,6,20,.60)_50%,rgba(4,6,20,.80)_100%)]",
    heroFallback: "bg-[radial-gradient(ellipse_at_60%_20%,rgba(80,100,200,.18),transparent_45%),linear-gradient(145deg,#0e1030,#050614_60%,#0c0e28)]",
    align: "left",
    serif: false,
    accent: "#8090e0",
    galleryBg: "bg-[#060714]",
    gallerySectionPad: "py-16 md:py-22",
    contentWidth: "max-w-6xl",
    border: "border-blue-900/35",
    muted: "text-blue-200/35",
    footerBg: "bg-[#050610] text-blue-200/22",
    cta: "border border-blue-400/30 rounded-lg px-6 py-3 text-sm font-medium",
  },

  // 10. Ember — dark warm amber, intimate, fire-lit
  ember: {
    page: "bg-[#140c04] text-[#e8d0a8]",
    heroHeight: "min-h-[80vh]",
    heroOverlay: "bg-[linear-gradient(120deg,rgba(16,8,0,.92)_0%,rgba(16,8,0,.58)_48%,rgba(16,8,0,.74)_100%)]",
    heroFallback: "bg-[radial-gradient(ellipse_at_75%_35%,rgba(200,100,20,.20),transparent_45%),linear-gradient(145deg,#241408,#100800_60%,#1c1004)]",
    align: "left",
    serif: false,
    accent: "#f09840",
    galleryBg: "bg-[#100c04]",
    gallerySectionPad: "py-14 md:py-18",
    contentWidth: "max-w-6xl",
    border: "border-amber-900/35",
    muted: "text-amber-200/35",
    footerBg: "bg-[#0c0804] text-amber-200/25",
    cta: "border border-amber-500/30 rounded px-6 py-3 text-sm font-semibold",
  },
};

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
      "*,projects(name,project_type,project_date,clients(name),workspaces(name,logo_url,plan,instagram_url,tiktok_url,facebook_url,website_url,whatsapp_url))",
    )
    .eq("slug", slug)
    .single();
  if (!gallery)
    return <UnavailableScreen reason="This gallery doesn't exist or the link is wrong." />;
  if (gallery.status !== "published")
    return <UnavailableScreen reason="This gallery isn't published yet." />;
  if (gallery.expiry_date && new Date(gallery.expiry_date) < new Date())
    return <UnavailableScreen reason="This gallery's delivery window has ended." />;
  if (gallery.password_enabled) {
    if (!gallery.password_hash)
      return <UnavailableScreen reason="This gallery password is unavailable." />;
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
    name: string; project_type: string; project_date: string | null;
    clients: { name: string } | null;
    workspaces: {
      name: string; logo_url: string | null; plan: string;
      instagram_url: string | null; tiktok_url: string | null;
      facebook_url: string | null; website_url: string | null; whatsapp_url: string | null;
    } | null;
  } | null;

  const studioName = project?.workspaces?.name ?? "RAWI";
  const studioLogo = project?.workspaces?.logo_url;
  const clientFirstName = project?.clients?.name?.trim().split(/\s+/)[0];
  const plan = project?.workspaces?.plan ?? "free";
  const socialLinks = [
    { label: "Instagram", url: project?.workspaces?.instagram_url },
    { label: "TikTok", url: project?.workspaces?.tiktok_url },
    { label: "Facebook", url: project?.workspaces?.facebook_url },
    { label: "Website", url: project?.workspaces?.website_url },
    { label: "WhatsApp", url: project?.workspaces?.whatsapp_url },
  ].filter((item): item is { label: string; url: string } => Boolean(item.url));

  const commentsAllowed =
    (plan === "creator" || plan === "pro" || plan === "studio") && gallery.comments_enabled;

  const typedSections = (sections ?? []).map((section) => ({
    id: section.id as string,
    title: section.title as string,
    media: (
      (section.media as unknown as {
        id: string; media_type: "image" | "video" | "raw";
        sort_order?: number; storage_path?: string;
        thumbnail_path?: string | null; signed_url?: string | null; thumbnail_url?: string | null;
      }[]) ?? []
    ).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
  }));

  const allMedia = typedSections.flatMap((section) => section.media);
  const previewPaths = Array.from(
    new Set(allMedia.map((item) => item.thumbnail_path ?? item.storage_path).filter(Boolean) as string[]),
  );
  const signedByPath = new Map<string, string>();
  if (previewPaths.length) {
    const { data: signed } = await admin.storage.from("media").createSignedUrls(previewPaths, 60 * 10);
    for (const item of signed ?? []) {
      if (item.path && item.signedUrl) signedByPath.set(item.path, item.signedUrl);
    }
  }
  for (const section of typedSections)
    for (const item of section.media) {
      const previewPath = item.thumbnail_path ?? item.storage_path;
      if (previewPath) item.thumbnail_url = signedByPath.get(previewPath) ?? null;
    }

  const hasMedia = allMedia.length > 0;
  const photoCount = allMedia.filter((item) => item.media_type === "image").length;
  const videoCount = allMedia.filter((item) => item.media_type === "video").length;
  const coverMedia = allMedia.find((item) => item.media_type === "image" && item.thumbnail_url);
  const coverUrl = coverMedia?.thumbnail_url ?? null;
  const comments = commentsAllowed ? await getVisitorComments(gallery.id) : [];
  const projectDate = project?.project_date
    ? new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(project.project_date))
    : null;

  const galleryTheme = (((gallery as unknown as { theme?: string }).theme ?? "clean") as GalleryTheme);
  const t = THEME[galleryTheme] ?? THEME.clean;
  const centered = t.align === "center";
  const dark = ["dark", "noir", "forest", "midnight", "ember"].includes(galleryTheme);

  return (
    <div className={`min-h-screen ${t.page}`}>
      {/* ── Hero ── */}
      <section
        className={`relative overflow-hidden text-white ${t.heroHeight}`}
        style={coverUrl ? { backgroundImage: `url(${coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        <div className={`absolute inset-0 ${t.heroOverlay}`} />
        {!coverUrl && <div className={`absolute inset-0 ${t.heroFallback}`} />}

        <div className={`relative z-10 flex flex-col px-6 py-6 md:px-10 md:py-8 lg:px-14 ${t.heroHeight}`}>
          {/* Header */}
          <header className="flex items-center justify-between text-sm">
            <div className="flex min-w-0 items-center gap-2.5">
              {studioLogo && (
                <Image src={studioLogo} alt={`${studioName} logo`} width={40} height={40}
                  className="h-9 w-9 shrink-0 rounded-xl border border-white/20 object-cover" />
              )}
              <span className="truncate font-extrabold tracking-[0.08em]">{studioName}</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              {socialLinks.length > 0 && (
                <nav aria-label={`${studioName} social media`} className="flex items-center gap-1 sm:gap-2">
                  {socialLinks.map((item) => (
                    <a key={item.label} href={item.url} target="_blank" rel="noopener noreferrer"
                      aria-label={item.label} title={item.label}
                      className="grid h-8 w-8 place-items-center rounded-full border border-white/20 text-white/75 transition hover:-translate-y-0.5 hover:border-white/45 hover:text-white sm:h-9 sm:w-9">
                      <SocialIcon label={item.label} />
                    </a>
                  ))}
                </nav>
              )}
              {gallery.branding_enabled && <span className="hidden sm:inline text-xs">Delivered with RAWI</span>}
              {gallery.favorites_enabled && <span className="grid h-9 w-9 place-items-center rounded-full border border-white/20">♡</span>}
              {gallery.downloads_enabled && <span className="grid h-9 w-9 place-items-center rounded-full border border-white/20">↓</span>}
            </div>
          </header>

          {/* Hero content */}
          <div className={`my-auto py-16 ${centered ? "mx-auto w-full max-w-4xl text-center" : "max-w-xl"}`}>
            <span className="mb-4 block text-[11px] font-extrabold tracking-[.18em]" style={{ color: t.accent }}>
              {project?.project_type?.toUpperCase().replace("_", " + ") || "GALLERY"}
            </span>
            <h1 className={t.serif
              ? "font-serif text-[50px] leading-[1] sm:text-[70px] lg:text-[86px]"
              : "text-[48px] font-semibold leading-[.92] tracking-[-.055em] sm:text-[64px] lg:text-[78px]"
            }>
              {gallery.title}
            </h1>
            {clientFirstName && (
              <p className={`mt-5 text-lg font-medium text-white/85 ${centered ? "text-center" : ""}`}>
                Hi {clientFirstName}, your gallery is ready.
              </p>
            )}
            <div className={`mt-5 flex flex-wrap gap-3 text-sm text-white/75 ${centered ? "justify-center" : ""}`}>
              {projectDate && <span>{projectDate}</span>}
              <span>{studioName}</span>
            </div>
            {gallery.description && (
              <p className={`mt-7 text-[15px] leading-7 text-white/70 ${centered ? "mx-auto max-w-xl" : "max-w-md"}`}>
                {gallery.description}
              </p>
            )}
            <div className={`mt-7 flex gap-5 text-sm text-white/80 ${centered ? "justify-center" : ""}`}>
              <span>▣ {photoCount} Photos</span>
              {videoCount > 0 && <span>▻ {videoCount} Videos</span>}
            </div>
            <a href="#gallery" className={`mt-8 inline-flex ${t.cta}`}>
              View Gallery →
            </a>
          </div>
        </div>
      </section>

      {/* ── Media grid ── */}
      <section id="gallery" className={t.galleryBg}>
        <div className={`mx-auto ${t.contentWidth} px-5 ${t.gallerySectionPad}`}>
          <div className={`mb-8 border-b pb-6 ${t.border} ${centered ? "text-center" : ""}`}>
            <span className="text-[10px] font-extrabold tracking-[.16em]" style={{ color: t.accent }}>
              CURATED DELIVERY
            </span>
            <h2 className={t.serif
              ? "mt-2 font-serif text-4xl md:text-5xl"
              : "mt-2 text-3xl font-semibold tracking-[-.04em]"
            }>
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
              clientName={project?.clients?.name ?? undefined}
            />
          ) : (
            <div className={`py-24 text-center ${t.muted}`}>
              This gallery is published but doesn&rsquo;t have any media yet.
            </div>
          )}
        </div>
      </section>

      {commentsAllowed && <ClientComments galleryId={gallery.id} initialComments={comments} />}

      <footer className={`border-t px-6 py-8 text-center text-xs ${t.border} ${t.footerBg}`}>
        {gallery.branding_enabled ? "Made with RAWI" : studioName}
      </footer>
    </div>
  );
}

function SocialIcon({ label }: { label: string }) {
  if (label === "Instagram")
    return (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" />
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
  if (label === "WhatsApp")
    return (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.6Z" />
        <path d="M9 8.5c.4 2.5 2 4.1 4.5 5l1.2-1.2c.3-.3.7-.4 1.1-.2l1.7.8c.4.2.6.6.5 1-.3 1.4-1.4 2.1-2.8 2.1-4 0-7.2-3.2-7.2-7.2 0-1.4.7-2.5 2.1-2.8.4-.1.8.1 1 .5l.8 1.7c.2.4.1.8-.2 1.1L10.5 10" />
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
        <span className="inline-grid w-10 h-10 rounded-[50%_50%_50%_8px] bg-rawi-yellow place-items-center text-black font-black -rotate-[8deg] mb-6">R</span>
        <h1 className="text-2xl font-extrabold">Gallery unavailable</h1>
        <p className="text-gray-400 mt-3">{reason}</p>
      </div>
    </div>
  );
}
