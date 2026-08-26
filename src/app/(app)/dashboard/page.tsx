import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { HomeSocialLinks } from "@/components/app-shell/HomeSocialLinks";

export default async function DashboardPage() {
  const { profile, workspace } = await getCurrentWorkspace();
  if (!workspace) redirect("/onboarding");

  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, project_type, created_at")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { count: projectCount } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspace.id);

  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const recent = projects?.[0];
  const storageGb = ((workspace.storage_used_bytes || 0) / 1024 ** 3).toFixed(1);

  return (
    <div className="max-w-[1500px] mx-auto pb-8">
      <header className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-7">
        <div>
          <span className="text-[11px] font-extrabold tracking-[0.18em] text-gray-400">CREATOR WORKSPACE</span>
          <h1 className="text-[34px] md:text-[42px] tracking-[-0.05em] leading-none mt-3">Good morning, {firstName}.</h1>
          <p className="text-lg md:text-xl text-gray-400 mt-2">Ready to deliver something beautiful?</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/projects" className="bg-rawi-yellow text-black rounded-xl px-5 py-3 font-extrabold text-sm shadow-sm">＋ New Project</Link>
            <Link href="/projects" className="bg-white border border-gray-200 rounded-xl px-5 py-3 font-bold text-sm">↥ Upload Media</Link>
          </div>
        </div>
        <HomeSocialLinks workspaceId={workspace.id} />
      </header>

      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
        <Stat icon="▢" value={String(projectCount ?? 0)} label="Projects" sub="Active galleries" />
        <Stat icon="▧" value="—" label="Photos" sub="Across all projects" />
        <Stat icon="▦" value="—" label="Galleries" sub="Published" />
        <Stat icon="↓" value="—" label="Downloads" sub="Client activity" />
        <Stat icon="♡" value="—" label="Favorites" sub="By clients" />
        <Stat icon="▱" value={`${storageGb} GB`} label="Storage used" sub={`of ${(workspace.storage_limit_bytes / 1024 ** 3).toFixed(1)} GB`} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.12fr_.88fr] gap-5">
        <div className="bg-white border border-gray-200 rounded-[22px] p-4 md:p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div><h2 className="text-xl font-bold">Recent Projects</h2><p className="text-xs text-gray-400 mt-1">Your active galleries and drafts.</p></div>
            <Link href="/projects" className="text-xs font-bold text-[#b88600]">View all</Link>
          </div>
          {recent ? (
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <div className="relative h-[250px] md:h-[340px] bg-[radial-gradient(circle_at_65%_55%,rgba(255,212,0,.18),transparent_22%),linear-gradient(145deg,#303030,#090909_60%,#202020)]">
                <span className="absolute top-4 left-4 rounded-full bg-black/65 text-white px-3 py-1.5 text-[10px] font-bold tracking-wide">● {recent.status.toUpperCase()}</span>
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <div className="text-[10px] tracking-[.18em] text-white/55 mb-2">{recent.project_type.replace("_", " ").toUpperCase()}</div>
                  <div className="text-3xl md:text-4xl tracking-[-.04em]">{recent.name}</div>
                </div>
              </div>
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div><h3 className="font-bold text-lg">{recent.name}</h3><p className="text-xs text-gray-400 mt-1 capitalize">{recent.project_type.replace("_", " ")} · {recent.status}</p></div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/projects/${recent.id}`} className="rounded-full border border-gray-200 px-4 py-2 text-xs font-bold">Open project</Link>
                  <Link href={`/projects/${recent.id}`} className="rounded-full bg-black text-white px-4 py-2 text-xs font-bold">View gallery</Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#111] text-white p-10 min-h-[320px] flex flex-col justify-end">
              <span className="text-rawi-yellow text-xs font-bold">YOUR FIRST STORY STARTS HERE</span>
              <h3 className="text-3xl mt-2">Create a project worth sharing.</h3>
              <Link href="/projects" className="mt-5 bg-rawi-yellow text-black rounded-full px-5 py-3 font-bold text-sm self-start">＋ Create project</Link>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-[22px] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5"><h2 className="text-xl font-bold">Activity</h2><Link href="/analytics" className="text-xs font-bold text-[#b88600]">View analytics</Link></div>
            <div className="space-y-1">
              <Activity icon="♡" title="Client favorites will appear here" sub="See which images your clients love." />
              <Activity icon="★" title="Ratings at a glance" sub="Track your highest-rated work." />
              <Activity icon="↓" title="Download activity" sub="Know when clients download their files." />
              <Activity icon="◉" title="Gallery views" sub="Measure engagement with delivered work." />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-[22px] p-5 shadow-sm">
            <div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-[#fff6cf] grid place-items-center text-lg">↗</div><div><h2 className="text-xl font-bold">Share your work</h2><p className="text-sm text-gray-500 mt-1">{recent ? `${recent.name} is ready to share.` : "Publish a gallery and share it anywhere."}</p></div></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
              <ShareButton label="🔗 Copy link" />
              <ShareButton label="◉ WhatsApp" />
              <ShareButton label="◎ Instagram" />
              <ShareButton label="▦ QR Code" />
            </div>
          </div>
        </div>
      </section>

      {workspace.plan.toLowerCase() === "free" && (
        <div className="mt-5 rounded-[18px] bg-black text-white px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div><div className="font-bold">♛ &nbsp; You&apos;re on the Free plan</div><div className="text-xs text-white/55 mt-1">Upgrade to unlock more storage, branding and advanced analytics.</div></div>
          <button className="bg-rawi-yellow text-black rounded-xl px-5 py-2.5 text-xs font-extrabold">Upgrade now</button>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, value, label, sub }: { icon: string; value: string; label: string; sub: string }) {
  return <div className="bg-white border border-gray-200 rounded-[20px] p-4 min-h-[126px] shadow-sm"><div className="w-9 h-9 rounded-xl bg-[#fff8df] grid place-items-center mb-3">{icon}</div><div className="text-2xl font-extrabold tracking-[-.04em]">{value}</div><div className="text-xs font-bold mt-1">{label}</div><div className="text-[10px] text-gray-400 mt-1">{sub}</div></div>;
}
function Activity({ icon, title, sub }: { icon: string; title: string; sub: string }) { return <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"><div className="w-9 h-9 rounded-xl bg-[#fff8df] grid place-items-center">{icon}</div><div><div className="text-sm font-bold">{title}</div><div className="text-xs text-gray-400 mt-0.5">{sub}</div></div></div>; }
function ShareButton({ label }: { label: string }) { return <button className="rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-bold hover:bg-gray-50">{label}</button>; }
