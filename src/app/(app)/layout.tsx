import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/workspace";
import { Sidebar } from "@/components/app-shell/Sidebar";

// Every page under this layout reads the authenticated user's session and
// workspace — never statically prerendered.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, workspace } = await getCurrentWorkspace();

  if (!user) redirect("/login");
  if (!workspace) redirect("/onboarding");

  return (
    <div className="min-h-screen flex bg-[#f4f4f2]">
      <Sidebar storageUsedBytes={workspace.storage_used_bytes} storageLimitBytes={workspace.storage_limit_bytes} />
      <main className="flex-1 p-6 md:p-9 overflow-auto">{children}</main>
    </div>
  );
}
