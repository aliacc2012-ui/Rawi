import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/workspace";
import { Sidebar } from "@/components/app-shell/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, workspace } = await getCurrentWorkspace();
  if (!user) redirect("/login");
  if (!workspace) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-[#f4f4f2] md:flex">
      <Sidebar storageUsedBytes={workspace.storage_used_bytes} storageLimitBytes={workspace.storage_limit_bytes} />
      <main className="min-w-0 flex-1 overflow-x-hidden p-4 pb-24 sm:p-5 sm:pb-24 md:p-9 md:pb-9">{children}</main>
    </div>
  );
}
