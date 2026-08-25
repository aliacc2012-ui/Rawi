import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function DashboardPage() {
  const { profile, workspace } = await getCurrentWorkspace();
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, project_type, created_at")
    .eq("workspace_id", workspace!.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { count: projectCount } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspace!.id);

  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const hasProjects = (projects?.length ?? 0) > 0;

  return (
    <div>
      <div className="mb-8">
        <span className="text-[11px] font-extrabold tracking-[0.17em] text-gray-400">CREATOR WORKSPACE</span>
        <h1 className="text-[28px] md:text-[34px] tracking-[-0.04em] mt-1.5">Good to see you, {firstName}.</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4">
        <Stat label="Projects" value={String(projectCount ?? 0)} />
        <Stat label="Storage used" value={`${((workspace!.storage_used_bytes || 0) / 1024 ** 3).toFixed(1)} GB`} />
        <Stat label="Plan" value={workspace!.plan.toUpperCase()} />
      </div>

      <div className="bg-white border border-gray-200 rounded-[20px] p-5.5 mt-4">
        <div className="flex justify-between items-center mb-5.5">
          <div>
            <h3 className="text-[19px] font-semibold m-0">Recent projects</h3>
            <p className="text-xs text-gray-400 mt-1">Your active galleries and drafts.</p>
          </div>
          {hasProjects && (
            <Link href="/projects" className="font-bold text-sm">View all</Link>
          )}
        </div>

        {hasProjects ? (
          <div className="divide-y divide-gray-100">
            {projects!.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="flex items-center justify-between py-3 hover:opacity-70"
              >
                <div>
                  <h4 className="m-0 mb-1 font-medium">{p.name}</h4>
                  <span className="text-[11px] text-gray-400 capitalize">{p.project_type.replace("_", " ")} • {p.status}</span>
                </div>
                <span className="text-gray-400 text-sm">Open</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-14">
            <h4 className="text-xl font-semibold mb-2">Welcome to RAWI.</h4>
            <p className="text-gray-500 max-w-md mx-auto mb-6 text-sm leading-relaxed">
              Your work deserves a better delivery experience. Create your first project and turn your
              photos and films into a client-ready gallery.
            </p>
            <Link href="/projects" className="bg-rawi-yellow text-black font-extrabold rounded-full px-5 py-3 inline-block">
              + Create first project
            </Link>
          </div>
        )}
      </div>
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
