import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { NewProjectForm } from "@/components/app-shell/NewProjectForm";

export default async function ProjectsPage() {
  const { workspace } = await getCurrentWorkspace();
  const supabase = await createClient();

  const [{ data: projects }, { data: clients }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, status, project_type, created_at")
      .eq("workspace_id", workspace!.id)
      .order("created_at", { ascending: false }),
    supabase.from("clients").select("id, name").eq("workspace_id", workspace!.id).order("name"),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[11px] font-extrabold tracking-[0.17em] text-gray-400">CREATOR WORKSPACE</span>
          <h1 className="text-[28px] md:text-[34px] tracking-[-0.04em] mt-1.5">Projects</h1>
        </div>
        <NewProjectForm workspaceId={workspace!.id} clients={clients ?? []} />
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="bg-white border border-gray-200 rounded-[18px] p-3.5 block hover:shadow-md transition-shadow"
            >
              <div className="h-[150px] rounded-xl bg-gradient-to-br from-[#242424] to-[#0f0f0f] mb-3" />
              <h4 className="m-0 mb-1 font-medium">{p.name}</h4>
              <p className="text-[11px] text-gray-400 m-0 capitalize">{p.project_type.replace("_", " ")} • {p.status}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-300 rounded-[20px] py-16 text-center text-gray-500">
          No projects yet. Create your first one to start building a gallery.
        </div>
      )}
    </div>
  );
}
