import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { NewProjectForm } from "@/components/app-shell/NewProjectForm";
import { ProjectIcon, PublishIcon, DraftIcon, FeedbackIcon } from "@/components/ui/AppIcons";

type DashboardStats = {
  project_count: number; photo_count: number; published_count: number;
  download_count: number; favorite_count: number; new_feedback_count: number;
  feedback_by_project: Record<string, number>;
};

const CARD_THEMES = [
  { grad: "from-violet-950 via-[#0C0C1A] to-[#0C0C1A]", glow: "rgba(167,139,250,0.30)", border: "rgba(167,139,250,0.15)", label: "text-violet-400" },
  { grad: "from-cyan-950 via-[#0C0C1A] to-[#0C0C1A]",   glow: "rgba(34,211,238,0.25)",  border: "rgba(34,211,238,0.14)",  label: "text-cyan-400"   },
  { grad: "from-amber-950 via-[#0C0C1A] to-[#0C0C1A]",  glow: "rgba(255,212,0,0.25)",   border: "rgba(255,212,0,0.14)",   label: "text-amber-400"  },
  { grad: "from-emerald-950 via-[#0C0C1A] to-[#0C0C1A]",glow: "rgba(52,211,153,0.25)",  border: "rgba(52,211,153,0.14)",  label: "text-emerald-400"},
  { grad: "from-rose-950 via-[#0C0C1A] to-[#0C0C1A]",   glow: "rgba(251,113,133,0.25)", border: "rgba(251,113,133,0.14)", label: "text-rose-400"   },
  { grad: "from-fuchsia-950 via-[#0C0C1A] to-[#0C0C1A]",glow: "rgba(232,121,249,0.25)", border: "rgba(232,121,249,0.14)", label: "text-fuchsia-400"},
] as const;

const STAT_CFG = [
  { iconCls: "text-violet-400",  shadow: "hover:shadow-[0_0_24px_rgba(167,139,250,0.12)]", hoverBorder: "hover:border-violet-500/25" },
  { iconCls: "text-emerald-400", shadow: "hover:shadow-[0_0_24px_rgba(52,211,153,0.12)]",  hoverBorder: "hover:border-emerald-500/25" },
  { iconCls: "text-white/40",    shadow: "",                                                hoverBorder: "" },
  { iconCls: "text-amber-400",   shadow: "hover:shadow-[0_0_24px_rgba(251,191,36,0.15)]",  hoverBorder: "hover:border-amber-500/30" },
];

export default async function ProjectsPage() {
  const { workspace } = await getCurrentWorkspace();
  const supabase = await createClient();

  const [{ data: projects }, { data: clients }, { data: statsData }] = await Promise.all([
    supabase.from("projects").select("id, name, status, project_type, created_at").eq("workspace_id", workspace!.id).order("created_at", { ascending: false }),
    supabase.from("clients").select("id, name").eq("workspace_id", workspace!.id).order("name"),
    supabase.rpc("rawi_dashboard_stats", { target_workspace_id: workspace!.id }),
  ]);

  const stats = (statsData ?? {}) as Partial<DashboardStats>;
  const newFeedbackByProject = stats.feedback_by_project ?? {};
  const total = projects?.length ?? 0;
  const published = (projects ?? []).filter((p) => p.status === "published").length;
  const drafts = total - published;
  const totalNewFeedback = stats.new_feedback_count ?? 0;

  const STATS = [
    { label: "All projects",  value: total,             Icon: ProjectIcon,  idx: 0, alert: false },
    { label: "Published",     value: published,          Icon: PublishIcon,  idx: 1, alert: false },
    { label: "Drafts",        value: drafts,             Icon: DraftIcon,    idx: 2, alert: false },
    { label: "New feedback",  value: totalNewFeedback,   Icon: FeedbackIcon, idx: 3, alert: totalNewFeedback > 0 },
  ];

  return (
    <div className="max-w-[1500px] mx-auto pb-8 relative">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-8%] left-[18%] w-[480px] h-[480px] rounded-full bg-violet-600/[.06] blur-[120px]" />
        <div className="absolute top-[35%] right-[-4%] w-[380px] h-[380px] rounded-full bg-cyan-500/[.05] blur-[100px]" />
        <div className="absolute bottom-[8%] left-[8%] w-[320px] h-[320px] rounded-full bg-rawi-yellow/[.04] blur-[90px]" />
      </div>

      {/* Page header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
        <div>
          <span className="text-[11px] font-extrabold tracking-[0.18em] text-white/30">CREATOR WORKSPACE</span>
          <h1 className="font-cormorant text-[56px] md:text-[72px] tracking-[-0.03em] leading-none mt-2 text-[#F0EFFF]">Projects</h1>
          <p className="text-white/40 mt-2 text-sm">Create, publish and manage every client delivery from one place.</p>
        </div>
        <NewProjectForm workspaceId={workspace!.id} clients={clients ?? []} />
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {STATS.map(({ label, value, Icon, idx, alert }) => {
          const s = STAT_CFG[idx] ?? { iconCls: "text-white/40", shadow: "", hoverBorder: "" };
          return (
            <div
              key={label}
              className={`bg-rawi-panel border border-white/[.07] rounded-[18px] px-4 py-4 flex items-center justify-between transition-all duration-300 ${s.shadow} ${s.hoverBorder} ${alert ? "border-amber-500/30 shadow-[0_0_24px_rgba(251,191,36,0.10)]" : ""}`}
            >
              <div>
                <div className="text-[11px] text-white/40 font-medium">{label}</div>
                <div className="font-cormorant text-[44px] leading-none font-bold tracking-[-0.02em] mt-1 text-[#F0EFFF]">{value}</div>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-white/[.05] grid place-items-center ${s.iconCls}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Project grid panel */}
      <div className="bg-rawi-panel border border-white/[.07] rounded-[24px] p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-[#F0EFFF]">
              <ProjectIcon className="h-5 w-5" />Your work
            </h2>
            <p className="text-xs text-white/40 mt-1">Open a project to upload media, configure the gallery and share it.</p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="rounded-full bg-white/[.05] border border-white/[.07] px-3 py-2 text-white/45">Newest first</span>
            <span className="rounded-full bg-white/[.05] border border-white/[.07] px-3 py-2 text-white/45">{total} total</span>
          </div>
        </div>

        {projects && projects.length > 0 ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((p, index) => {
              const newCount = newFeedbackByProject[p.id] ?? 0;
              const theme = CARD_THEMES[index % CARD_THEMES.length];
              return (
                <div
                  key={p.id}
                  className="group overflow-hidden rounded-[20px] border border-white/[.07] hover:border-white/[.18] bg-[#0C0C1A] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-300"
                >
                  {/* Visual area */}
                  <div className={`relative h-[200px] bg-gradient-to-br ${theme.grad} overflow-hidden`}>
                    <Link prefetch href={`/projects/${p.id}`} className="absolute inset-0 z-0" aria-label={`Open ${p.name}`} />
                    {/* Noise */}
                    <div
                      className="absolute inset-0 opacity-[.05]"
                      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "128px" }}
                    />
                    {/* Shimmer on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,.05)_48%,transparent_49%)]" />
                    {/* Accent glow orb */}
                    <div
                      className="absolute top-[-20%] right-[-10%] w-44 h-44 rounded-full blur-3xl opacity-50 group-hover:opacity-90 transition-opacity duration-500"
                      style={{ background: theme.glow }}
                    />
                    {/* Status badge */}
                    <span
                      className={`absolute top-3 left-3 z-10 rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-wide inline-flex items-center gap-1.5 ${
                        p.status === "published"
                          ? "bg-emerald-500/90 text-white"
                          : "bg-white/[.07] border border-white/[.12] text-white/55"
                      }`}
                    >
                      {p.status === "published"
                        ? <><PublishIcon className="h-3.5 w-3.5" />PUBLISHED</>
                        : <><DraftIcon className="h-3.5 w-3.5" />DRAFT</>}
                    </span>
                    {/* Feedback + index */}
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                      {newCount > 0 && (
                        <Link
                          prefetch
                          href={`/projects/${p.id}#feedback`}
                          className="rounded-full bg-rawi-yellow px-3 py-1.5 text-[10px] font-extrabold text-black shadow-lg hover:scale-105 transition inline-flex items-center gap-1.5"
                        >
                          <FeedbackIcon className="h-3.5 w-3.5" />{newCount} NEW
                        </Link>
                      )}
                      <span className="rounded-full bg-black/50 border border-white/[.08] text-white/45 px-2.5 py-1.5 text-[10px]">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    {/* Title overlay */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                      <div className={`text-[10px] tracking-[.16em] mb-1.5 font-semibold ${theme.label}`}>
                        {p.project_type.replace("_", " ").toUpperCase()}
                      </div>
                      <h3 className="font-cormorant text-[26px] tracking-[-0.02em] text-white leading-tight">{p.name}</h3>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="p-4 flex items-center justify-between gap-3" style={{ borderTop: `1px solid ${theme.border}` }}>
                    <div>
                      <div className="text-[10px] text-white/30">Created</div>
                      <div className="text-sm font-bold mt-0.5 text-white/70">
                        {new Date(p.created_at).toLocaleDateString("en-AE", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <Link
                      prefetch
                      href={`/projects/${p.id}`}
                      className="rounded-full px-4 py-2 text-xs font-bold border border-white/[.08] bg-white/[.04] text-white/55 group-hover:bg-white/[.10] group-hover:text-white group-hover:border-white/[.20] transition-all duration-200"
                    >
                      Open →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[20px] border border-dashed border-white/[.10] bg-white/[.01] py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 grid place-items-center mx-auto mb-4">
              <ProjectIcon className="h-7 w-7" />
            </div>
            <h3 className="font-cormorant text-[38px] tracking-[-0.03em] text-[#F0EFFF]">Create your first story.</h3>
            <p className="text-sm text-white/35 max-w-md mx-auto mt-2 mb-6">
              Start a project, upload your work and publish a client-ready gallery in minutes.
            </p>
            <NewProjectForm workspaceId={workspace!.id} clients={clients ?? []} />
          </div>
        )}
      </div>
    </div>
  );
}
