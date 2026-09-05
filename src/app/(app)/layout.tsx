import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/workspace";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/app-shell/Sidebar";

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, workspace: existingWorkspace } = await getCurrentWorkspace();
  if (!user) redirect("/login");

  let workspace = existingWorkspace;

  // Auto-create a workspace on first login so the user goes straight to dashboard
  if (!workspace) {
    const supabase = await createClient();
    const name: string =
      ((user.user_metadata?.full_name as string | undefined)?.trim()) ||
      (user.email?.split("@")[0]) ||
      "my-studio";
    const slug = `${slugify(name)}-${user.id.slice(0, 6)}`;
    const { data } = await supabase
      .from("workspaces")
      .insert({ owner_id: user.id, name, slug })
      .select()
      .single();
    workspace = data;
  }

  if (!workspace) redirect("/login");

  return (
    <div className="min-h-screen bg-rawi-ink text-[#F0EFFF] md:flex">
      <Sidebar storageUsedBytes={workspace.storage_used_bytes} storageLimitBytes={workspace.storage_limit_bytes} />
      <main className="min-w-0 flex-1 overflow-x-hidden p-4 pb-24 sm:p-5 sm:pb-24 md:p-9 md:pb-9">{children}</main>
    </div>
  );
}
