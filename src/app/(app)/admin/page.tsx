import { getCurrentWorkspace } from "@/lib/workspace";
import { createClient } from "@/lib/supabase/server";
import { BillingSettingsForm } from "@/components/app-shell/BillingSettingsForm";
import { SocialLinksForm } from "@/components/app-shell/SocialLinksForm";
import { ThumbnailBackfill } from "@/components/app-shell/ThumbnailBackfill";

type WorkspaceWithBillingSettings = { id:string; renewal_reminder_days?:number|null };

export default async function AdminPage(){
  const{workspace}=await getCurrentWorkspace();
  const supabase=await createClient();
  const billingWorkspace=workspace as WorkspaceWithBillingSettings;
  const days=Number(billingWorkspace?.renewal_reminder_days??3);
  const[{data:social},{data:projectRows}]=await Promise.all([
    supabase.from("workspaces").select("instagram_url,tiktok_url,facebook_url,website_url").eq("id",workspace!.id).single(),
    supabase.from("projects").select("id").eq("workspace_id",workspace!.id)
  ]);
  const initialLinks={instagram:social?.instagram_url||"",tiktok:social?.tiktok_url||"",facebook:social?.facebook_url||"",website:social?.website_url||""};
  const projectIds=(projectRows??[]).map(p=>p.id);
  let optimizableImages=0;
  if(projectIds.length){const{count}=await supabase.from("media").select("id",{count:"exact",head:true}).in("project_id",projectIds).eq("media_type","image");optimizableImages=count??0}
  return <div className="max-w-[1100px] mx-auto pb-8"><div className="mb-7"><span className="text-[11px] font-extrabold tracking-[0.18em] text-gray-400">RAWI ADMIN</span><h1 className="text-[34px] md:text-[42px] tracking-[-0.05em] leading-none mt-3">System settings</h1><p className="text-gray-400 mt-2">Manage operational settings without changing code or Vercel configuration.</p></div><div className="space-y-5"><BillingSettingsForm workspaceId={workspace!.id} initialDays={days}/><div className="bg-white border border-gray-200 rounded-[22px] p-5 md:p-6 shadow-sm"><h2 className="text-xl font-bold">Social presence</h2><p className="text-sm text-gray-400 mt-1">Manage the social profiles connected to this RAWI workspace.</p><div className="mt-5"><SocialLinksForm workspaceId={workspace!.id} initialLinks={initialLinks}/></div></div><ThumbnailBackfill workspaceId={workspace!.id} initialPending={optimizableImages}/></div></div>
}