import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { HomeSocialLinks } from "@/components/app-shell/HomeSocialLinks";
import { StatCard } from "@/components/app-shell/StatCard";
import {
  ProjectIcon, PhotoIcon, GalleryIcon, DownloadIcon, HeartIcon,
  FeedbackIcon, StorageIcon, UploadIcon, TrendIcon, ChartIcon,
} from "@/components/ui/AppIcons";

type DashboardStats = {
  project_count: number; photo_count: number; published_count: number;
  download_count: number; favorite_count: number; new_feedback_count: number;
  feedback_by_project: Record<string, number>;
};
const EMPTY: DashboardStats = {
  project_count: 0, photo_count: 0, published_count: 0,
  download_count: 0, favorite_count: 0, new_feedback_count: 0, feedback_by_project: {},
};

const GRADIENTS = [
  "from-[#1a0a2e] via-[#11001c] to-[#06060F]",
  "from-[#0a1628] via-[#060d1a] to-[#06060F]",
  "from-[#0d1a0a] via-[#081007] to-[#06060F]",
  "from-[#1a1000] via-[#100a00] to-[#06060F]",
  "from-[#1a0a0a] via-[#110606] to-[#06060F]",
];

const PROJECT_TYPE_LABELS: Record<string, string> = {
  wedding: "Wedding", portrait: "Portrait", corporate: "Corporate",
  event: "Event", automotive: "Automotive", landscape: "Landscape", other: "Editorial",
};

function getHour() {
  return new Date().getHours();
}
function getGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const { profile, workspace } = await getCurrentWorkspace();
  if (!workspace) redirect("/onboarding");
  const s = await createClient();

  const [{ data: projects }, { data: statsData, error: statsError }] = await Promise.all([
    s.from("projects").select("id,name,status,project_type,created_at")
      .eq("workspace_id", workspace.id).order("created_at", { ascending: false }).limit(6),
    s.rpc("rawi_dashboard_stats", { target_workspace_id: workspace.id }),
  ]);

  const recentProjects = projects ?? [];
  const stats = !statsError && statsData ? (statsData as DashboardStats) : EMPTY;
  const feedbackByProject = stats.feedback_by_project ?? {};
  const links = {
    instagram: workspace.instagram_url || "", tiktok: workspace.tiktok_url || "",
    facebook: workspace.facebook_url || "", website: workspace.website_url || "",
  };
  const recent = recentProjects[0];
  const recentFeedback = recent ? feedbackByProject[recent.id] ?? 0 : 0;
  const feedbackProject = recentProjects.find(p => (feedbackByProject[p.id] ?? 0) > 0);
  const storageGB = ((workspace.storage_used_bytes || 0) / 1024 ** 3);
  const hour = getHour();
  const greeting = getGreeting(hour);
  const firstName = profile?.full_name?.split(" ")[0] || "there";

  const statTiles = [
    { value: stats.project_count, label: "Projects", icon: <ProjectIcon className="h-4 w-4 text-violet-300" />, color: "bg-violet-500/20", textColor: "text-violet-200", glowColor: "#8b5cf6", delay: 0 },
    { value: stats.photo_count, label: "Photos", icon: <PhotoIcon className="h-4 w-4 text-cyan-300" />, color: "bg-cyan-500/20", textColor: "text-cyan-200", glowColor: "#06b6d4", delay: 80 },
    { value: stats.published_count, label: "Published", icon: <GalleryIcon className="h-4 w-4 text-emerald-300" />, color: "bg-emerald-500/20", textColor: "text-emerald-200", glowColor: "#10b981", delay: 160 },
    { value: stats.download_count, label: "Downloads", icon: <DownloadIcon className="h-4 w-4 text-blue-300" />, color: "bg-blue-500/20", textColor: "text-blue-200", glowColor: "#3b82f6", delay: 240 },
    { value: stats.favorite_count, label: "Favorites", icon: <HeartIcon className="h-4 w-4 text-rose-300" />, color: "bg-rose-500/20", textColor: "text-rose-200", glowColor: "#f43f5e", delay: 320 },
    { value: stats.new_feedback_count, label: "Feedback", icon: <FeedbackIcon className="h-4 w-4 text-amber-300" />, color: "bg-amber-500/20", textColor: "text-amber-200", glowColor: "#f59e0b", delay: 400, alert: stats.new_feedback_count > 0 },
    { value: parseFloat(storageGB.toFixed(1)), suffix: " GB", label: "Storage", icon: <StorageIcon className="h-4 w-4 text-slate-300" />, color: "bg-slate-500/20", textColor: "text-slate-200", glowColor: "#94a3b8", delay: 480 },
  ];

  return (
    <div className="relative max-w-[1500px] mx-auto pb-12 px-0">

      {/* ── Ambient background blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-violet-600/[.06] blur-[120px]" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-cyan-500/[.05] blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-rawi-yellow/[.04] blur-[100px]" />
      </div>

      {/* ── Header ── */}
      <header className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-10 pt-1">
        <div>
          <span className="text-[10px] font-extrabold tracking-[.22em] text-white/25 uppercase">
            — Creator Workspace
          </span>
          <h1 className="font-cormorant text-[42px] md:text-[58px] leading-[1.05] tracking-[-0.02em] mt-2 text-white">
            {greeting},<br />
            <span className="text-rawi-yellow italic">{firstName}.</span>
          </h1>
          <p className="text-base text-white/40 mt-3 font-montserrat tracking-wide">
            Ready to deliver something beautiful today?
          </p>
          <div className="flex gap-3 mt-6">
            <Link href="/projects" prefetch
              className="bg-rawi-yellow text-black rounded-xl px-5 py-3 font-extrabold text-sm inline-flex items-center gap-2 hover:brightness-110 transition">
              <ProjectIcon className="h-4 w-4" /> New Project
            </Link>
            <Link href="/projects" prefetch
              className="bg-white/[.06] border border-white/[.12] rounded-xl px-5 py-3 font-bold text-sm inline-flex items-center gap-2 text-white/70 hover:bg-white/[.10] transition">
              <UploadIcon className="h-4 w-4" /> Upload Media
            </Link>
          </div>
        </div>
        <HomeSocialLinks links={links} />
      </header>

      {/* ── Stats Row ── */}
      <section className="mb-10">
        <p className="text-[10px] font-extrabold tracking-[.22em] text-white/25 mb-3 uppercase">— Your Numbers</p>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
          {statTiles.map((tile) =>
            tile.label === "Feedback" && feedbackProject ? (
              <Link key={tile.label} href={`/projects/${feedbackProject.id}#feedback`} prefetch>
                <StatCard {...tile} value={tile.value} />
              </Link>
            ) : (
              <StatCard key={tile.label} {...tile} value={tile.value} />
            )
          )}
        </div>
      </section>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_.8fr] gap-5">

        {/* ── Recent Project (cinematic hero) ── */}
        <div>
          <p className="text-[10px] font-extrabold tracking-[.22em] text-white/25 mb-3 uppercase">— Latest Work</p>
          {recent ? (
            <div
              className={`relative overflow-hidden rounded-[24px] min-h-[380px] flex flex-col justify-end bg-gradient-to-br ${GRADIENTS[Math.abs(recent.name.charCodeAt(0)) % GRADIENTS.length]}`}
              style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.07), 0 24px 64px rgba(0,0,0,0.5)" }}
            >
              {/* noise texture */}
              <div className="absolute inset-0 opacity-[.035]"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "256px" }} />
              {/* gradient fade from bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* status badge top-left */}
              <div className="absolute top-5 left-5 flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-[.15em] uppercase ${recent.status === "published" ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30" : "bg-white/10 text-white/60 border border-white/10"}`}>
                  {recent.status}
                </span>
                <span className="px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-[.15em] uppercase bg-white/10 text-white/50 border border-white/10">
                  {PROJECT_TYPE_LABELS[recent.project_type] ?? recent.project_type}
                </span>
              </div>

              {/* feedback badge top-right */}
              {recentFeedback > 0 && (
                <Link href={`/projects/${recent.id}#feedback`} prefetch
                  className="absolute right-5 top-5 rounded-full bg-rawi-yellow px-3 py-2 text-[11px] font-extrabold text-black hover:scale-105 transition inline-flex items-center gap-1.5">
                  <FeedbackIcon className="h-3.5 w-3.5" /> {recentFeedback} new
                </Link>
              )}

              {/* content */}
              <div className="relative z-10 p-7">
                <p className="text-[10px] font-extrabold tracking-[.2em] text-white/35 uppercase mb-2">Most Recent</p>
                <h2 className="font-cormorant text-[48px] md:text-[56px] leading-[1] text-white tracking-tight">
                  {recent.name}
                </h2>
                <p className="text-white/40 mt-2 text-sm font-montserrat tracking-wide">
                  {new Date(recent.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
                <Link href={`/projects/${recent.id}`} prefetch
                  className="mt-5 inline-flex items-center gap-2 bg-white text-black rounded-full px-6 py-2.5 font-bold text-sm hover:bg-rawi-yellow transition">
                  Open Project →
                </Link>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[24px] min-h-[380px] flex flex-col justify-end bg-gradient-to-br from-[#1a0a2e] to-[#06060F]"
              style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.07)" }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="relative z-10 p-7">
                <h2 className="font-cormorant text-[52px] leading-[1.05] text-white">
                  Create your first<br /><span className="text-rawi-yellow italic">masterpiece.</span>
                </h2>
                <Link href="/projects" prefetch
                  className="mt-5 inline-flex items-center gap-2 bg-rawi-yellow text-black rounded-full px-6 py-2.5 font-bold text-sm hover:brightness-110 transition">
                  Start a Project →
                </Link>
              </div>
            </div>
          )}

          {/* mini project strip */}
          {recentProjects.length > 1 && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              {recentProjects.slice(1, 4).map((p, i) => (
                <Link key={p.id} href={`/projects/${p.id}`} prefetch
                  className={`relative overflow-hidden rounded-[16px] h-[90px] flex items-end p-3 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} hover:scale-[1.03] transition`}
                  style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.07)" }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="relative z-10 font-cormorant text-[15px] text-white leading-tight line-clamp-1">{p.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Right column: activity + quick stats ── */}
        <div className="flex flex-col gap-5">

          {/* Activity timeline */}
          <div>
            <p className="text-[10px] font-extrabold tracking-[.22em] text-white/25 mb-3 uppercase">— Live Activity</p>
            <div className="bg-rawi-panel rounded-[22px] p-5"
              style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.07)" }}>

              <TimelineItem
                dot="bg-amber-400" icon={<FeedbackIcon className="h-4 w-4 text-amber-300" />}
                title={stats.new_feedback_count > 0 ? `${stats.new_feedback_count} new client messages` : "No new feedback yet"}
                sub="Client feedback"
                href={feedbackProject ? `/projects/${feedbackProject.id}#feedback` : undefined}
                accent={stats.new_feedback_count > 0}
              />
              <TimelineItem
                dot="bg-rose-400" icon={<HeartIcon className="h-4 w-4 text-rose-300" />}
                title={`${stats.favorite_count.toLocaleString()} photos favorited`}
                sub="Client selections"
              />
              <TimelineItem
                dot="bg-blue-400" icon={<DownloadIcon className="h-4 w-4 text-blue-300" />}
                title={`${stats.download_count.toLocaleString()} total downloads`}
                sub="Delivery stats"
              />
              <TimelineItem
                dot="bg-emerald-400" icon={<GalleryIcon className="h-4 w-4 text-emerald-300" />}
                title={`${stats.published_count} galleries live`}
                sub="Active deliveries"
              />
              <TimelineItem
                dot="bg-violet-400" icon={<TrendIcon className="h-4 w-4 text-violet-300" />}
                title={`${stats.project_count} total projects`}
                sub="Your portfolio"
                last
              />
            </div>
          </div>

          {/* Quick insights card */}
          <div className="bg-rawi-panel rounded-[22px] p-5 flex-1"
            style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.07)" }}>
            <p className="text-[10px] font-extrabold tracking-[.22em] text-white/25 mb-4 uppercase">— Quick Insights</p>

            <InsightRow
              label="Avg photos / project"
              value={stats.project_count > 0 ? Math.round(stats.photo_count / stats.project_count) : 0}
              icon={<ChartIcon className="h-4 w-4 text-white/40" />}
            />
            <InsightRow
              label="Delivery rate"
              value={`${stats.project_count > 0 ? Math.round((stats.published_count / stats.project_count) * 100) : 0}%`}
              icon={<GalleryIcon className="h-4 w-4 text-white/40" />}
            />
            <InsightRow
              label="Downloads per gallery"
              value={stats.published_count > 0 ? Math.round(stats.download_count / stats.published_count) : 0}
              icon={<DownloadIcon className="h-4 w-4 text-white/40" />}
              last
            />

            <Link href="/analytics" prefetch
              className="mt-5 w-full flex items-center justify-center gap-2 border border-white/[.10] rounded-xl py-3 text-sm font-bold text-white/50 hover:text-white/80 hover:border-white/20 transition">
              <ChartIcon className="h-4 w-4" /> View full analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function TimelineItem({ dot, icon, title, sub, href, accent = false, last = false }: {
  dot: string; icon: React.ReactNode; title: string; sub: string;
  href?: string; accent?: boolean; last?: boolean;
}) {
  const inner = (
    <div className={`flex items-start gap-3 py-3.5 ${last ? "" : "border-b border-white/[.05]"} ${accent ? "group cursor-pointer" : ""}`}>
      <div className="relative flex flex-col items-center mt-0.5">
        <div className={`w-2 h-2 rounded-full shrink-0 ${dot} ${accent ? "animate-pulse" : ""}`} />
        {!last && <div className="w-px flex-1 bg-white/[.06] mt-1.5 min-h-[32px]" />}
      </div>
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        <div className="shrink-0 mt-0.5">{icon}</div>
        <div className="min-w-0">
          <p className={`text-sm font-semibold leading-tight truncate ${accent ? "text-amber-300 group-hover:text-amber-200" : "text-white/70"}`}>{title}</p>
          <p className="text-[11px] text-white/30 mt-0.5 font-montserrat tracking-wide">{sub}</p>
        </div>
        {accent && <span className="ml-auto text-amber-300 text-sm shrink-0">→</span>}
      </div>
    </div>
  );
  return href ? <Link href={href} prefetch>{inner}</Link> : inner;
}

function InsightRow({ label, value, icon, last = false }: {
  label: string; value: number | string; icon: React.ReactNode; last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-3 ${last ? "" : "border-b border-white/[.05]"}`}>
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-sm text-white/50 font-montserrat">{label}</span>
      </div>
      <span className="text-sm font-extrabold text-white/80 tabular-nums">{typeof value === "number" ? value.toLocaleString() : value}</span>
    </div>
  );
}
