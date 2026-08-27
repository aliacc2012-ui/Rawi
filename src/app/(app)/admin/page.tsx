import { getCurrentWorkspace } from "@/lib/workspace";
import { BillingSettingsForm } from "@/components/app-shell/BillingSettingsForm";

export default async function AdminPage(){const{workspace}=await getCurrentWorkspace();const days=Number((workspace as any)?.renewal_reminder_days||3);return <div className="max-w-[1100px] mx-auto pb-8"><div className="mb-7"><span className="text-[11px] font-extrabold tracking-[0.18em] text-gray-400">RAWI ADMIN</span><h1 className="text-[34px] md:text-[42px] tracking-[-0.05em] leading-none mt-3">System settings</h1><p className="text-gray-400 mt-2">Manage operational settings without changing code or Vercel configuration.</p></div><BillingSettingsForm workspaceId={workspace!.id} initialDays={days}/></div>}
