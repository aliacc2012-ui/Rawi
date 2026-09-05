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
    try {
      const supabase = await createClient();
      const name: string =
        ((user.user_metadata?.full_name as string | undefined)?.trim()) ||
        (user.email?.split("@")[0]) ||
        "my-studio";
      const slug = `${slugify(name)}-${user.id.slice(0, 6)}`;

      // Try insert; if slug conflicts use upsert via select-or-insert pattern
      const { data: inserted } = await supabase
        .from("workspaces")
        .insert({ owner_id: user.id, name, slug })
        .select()
        .single();

      if (inserted) {
        workspace = inserted;
      } else {
        // Might already exist (race or prior partial insert) — fetch it
        const { data: existing } = await supabase
          .from("workspaces")
          .select("*")
          .eq("owner_id", user.id)
          .limit(1)
          .maybeSingle();
        workspace = existing ?? null;
      }
    } catch {
      // Non-fatal: render layout with null workspace handled below
    }
  }

  // If still no workspace, render children anyway so there is no redirect loop
  const storage_used = workspace?.storage_used_bytes ?? 0;
  const storage_limit = workspace?.storage_limit_bytes ?? 5368709120;

  return (
    <div className="min-h-screen bg-rawi-ink text-[#F0EFFF] md:flex">
      <Sidebar storageUsedBytes={storage_used} storageLimitBytes={storage_limit} />
      <main className="min-w-0 flex-1 overflow-x-hidden p-4 pb-24 sm:p-5 sm:pb-24 md:p-9 md:pb-9">{children}</main>
    </div>
  );
}
