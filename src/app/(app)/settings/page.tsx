import { getCurrentWorkspace } from "@/lib/workspace";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BrandingForm } from "@/components/app-shell/BrandingForm";
import { PlanCheckoutButton } from "@/components/billing/PlanCheckoutButton";
import { CancelPlanButton } from "@/components/billing/CancelPlanButton";
import { PricingSection } from "@/components/billing/PricingSection";
import { PLAN_CONFIG, PLAN_ORDER, type PlanId } from "@/lib/plans";

type WorkspaceWithBillingSettings = { renewal_reminder_days?: number | null };

export default async function SettingsPage() {
  const { workspace } = await getCurrentWorkspace();
  const accent = workspace!.accent_color || "#FFD400";
  const supabase = await createClient();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan,status,current_period_end")
    .eq("workspace_id", workspace!.id)
    .maybeSingle();
  const { data: projectRows } = await supabase.from("projects").select("id").eq("workspace_id", workspace!.id);
  const projectIds = (projectRows ?? []).map((p) => p.id);
  let activeGalleries = 0;
  if (projectIds.length) {
    const { count: galleries } = await supabase
      .from("galleries").select("id", { count: "exact", head: true })
      .in("project_id", projectIds).eq("status", "published");
    activeGalleries = galleries ?? 0;
  }
  const usedBytes = workspace!.storage_used_bytes || 0;
  const currentPlan = (workspace!.plan || "free") as PlanId;
  const configuredLimit = PLAN_CONFIG[currentPlan]?.storageBytes || PLAN_CONFIG.free.storageBytes;
  const limitBytes = workspace!.storage_limit_bytes || configuredLimit;
  const usedGb = usedBytes / 1024 ** 3, limitGb = limitBytes / 1024 ** 3;
  const storagePct = Math.min(100, (usedBytes / Math.max(1, limitBytes)) * 100);
  const freeGb = Math.max(0, limitGb - usedGb);
  const periodEnd = subscription?.status === "active" && subscription.current_period_end
    ? new Date(subscription.current_period_end) : null;
  const msLeft = periodEnd ? periodEnd.getTime() - Date.now() : null;
  const daysLeft = msLeft !== null ? Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000))) : null;
  const billingWorkspace = workspace as WorkspaceWithBillingSettings;
  const reminderDays = Math.max(1, Math.min(30, Number(billingWorkspace.renewal_reminder_days ?? 3)));
  const showRenewal = currentPlan !== "free" && subscription?.status === "active" && daysLeft !== null && daysLeft <= reminderDays;

  return (
    <div className="max-w-[1500px] mx-auto pb-8 relative">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-5%] left-[20%] w-[450px] h-[450px] rounded-full bg-violet-600/[.05] blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[350px] h-[350px] rounded-full bg-rawi-yellow/[.04] blur-[100px]" />
      </div>

      {/* Page header */}
      <div className="mb-8">
        <span className="text-[11px] font-extrabold tracking-[0.18em] text-white/30">CREATOR WORKSPACE</span>
        <h1 className="font-cormorant text-[56px] md:text-[72px] tracking-[-0.03em] leading-none mt-2 text-[#F0EFFF]">Branding</h1>
        <p className="text-white/40 mt-2 text-sm">Shape how clients experience your studio before they even see the first photo.</p>
      </div>

      {/* Branding form + live preview (client component handles both) */}
      <BrandingForm
        workspaceId={workspace!.id}
        initialName={workspace!.name}
        initialAccent={accent}
      />

      {/* Plan section */}
      <section className="mt-6 space-y-5">
        {showRenewal && (
          <div className="rounded-[22px] border border-amber-400/30 bg-amber-900/[.12] p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="font-extrabold text-lg text-[#F0EFFF]">
                Your {PLAN_CONFIG[currentPlan].name} plan expires{" "}
                {daysLeft === 0 ? "today" : `in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}.
              </div>
              <p className="text-sm text-white/50 mt-1">Renew now to keep your {currentPlan === "pro" ? "1 TB" : "250 GB"} storage and paid features.</p>
            </div>
            <div className="md:min-w-[180px]">
              <PlanCheckoutButton plan={currentPlan as "creator" | "pro"} workspaceId={workspace!.id} featured />
            </div>
          </div>
        )}

        {/* Storage + plan overview */}
        <div className="bg-rawi-panel border border-white/[.07] rounded-[24px] p-6 md:p-8">
          <h2 className="font-cormorant text-[36px] tracking-[-0.03em] text-[#F0EFFF] mb-6">Plan &amp; storage</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="text-[11px] text-white/30 font-semibold tracking-widest mb-2">CURRENT PLAN</div>
              <div className="font-cormorant text-[52px] tracking-[-0.03em] text-[#F0EFFF] leading-none uppercase">{workspace!.plan}</div>
              {periodEnd && (
                <div className="text-sm text-white/35 mt-2">
                  Access until {periodEnd.toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex justify-between text-xs font-bold mb-3 text-white/60">
                <span>STORAGE USED</span>
                <span>{usedGb.toFixed(1)} GB / {limitGb >= 1024 ? (limitGb / 1024).toFixed(1) + " TB" : limitGb.toFixed(1) + " GB"}</span>
              </div>
              <div className="h-2 rounded-full bg-white/[.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${storagePct}%`, background: storagePct > 80 ? "#f87171" : storagePct > 60 ? "#fb923c" : "#34d399" }}
                />
              </div>
              <div className="text-xs text-white/35 mt-3">
                {freeGb >= 1024 ? (freeGb / 1024).toFixed(1) + " TB" : freeGb.toFixed(1) + " GB"} free · {activeGalleries} published {activeGalleries === 1 ? "gallery" : "galleries"}
              </div>
            </div>
          </div>
        </div>

        {/* Plan cards */}
        <PricingSection currentPlanId={currentPlan} workspaceId={workspace!.id} />
      </section>
    </div>
  );
}

function CustomPlanCard() {
  return (
    <div className="relative flex min-h-[390px] flex-col rounded-[22px] border border-white/[.07] bg-[linear-gradient(145deg,#141414,#050505)] p-6 text-white overflow-hidden">
      <div className="absolute top-[-40px] right-[-40px] w-40 h-40 rounded-full bg-violet-500/[.08] blur-3xl" />
      <div className="relative">
        <div className="text-[10px] font-extrabold tracking-widest text-white/30 mb-4">CUSTOM</div>
        <div className="font-cormorant text-[36px] leading-tight tracking-[-0.03em] text-[#F0EFFF]">Built for your workflow.</div>
        <p className="mt-4 text-sm leading-6 text-white/45">Custom storage, team access, gallery volume and priority support for studios with specific needs.</p>
        <ul className="mt-6 space-y-2.5 text-sm text-white/60">
          {["Flexible storage", "Multiple team members", "Tailored gallery limits", "Priority support"].map((f) => (
            <li key={f} className="flex gap-2"><span className="text-emerald-400 font-bold">✓</span>{f}</li>
          ))}
        </ul>
      </div>
      <Link href="/support?subject=Custom%20RAWI%20plan" className="mt-auto block rounded-full bg-rawi-yellow px-5 py-3 text-center text-sm font-extrabold text-black hover:opacity-90 transition">
        Talk to RAWI
      </Link>
    </div>
  );
}

function PlanCard({ plan, current, workspaceId, currentPlanId }: { plan: (typeof PLAN_CONFIG)[PlanId]; current: boolean; workspaceId: string; currentPlanId: PlanId }) {
  return (
    <div className={`relative flex flex-col min-h-[390px] rounded-[22px] p-6 overflow-hidden ${plan.featured ? "border-2 border-rawi-yellow bg-rawi-yellow/[.04]" : "border border-white/[.07] bg-rawi-panel"}`}>
      {plan.featured && (
        <div className="absolute -top-3 left-5 rounded-full bg-rawi-yellow px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-black">Most Popular</div>
      )}
      <div className="text-[10px] font-extrabold tracking-widest text-white/35 mb-4">{plan.name.toUpperCase()}</div>
      <div className="font-cormorant text-[52px] leading-none tracking-[-0.03em] text-[#F0EFFF]">
        {plan.priceAed}<span className="text-sm font-sans text-white/35 ml-1">{plan.priceAed !== 0 ? "AED/mo" : "Free"}</span>
      </div>
      <ul className="mt-6 space-y-2.5 text-sm flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2 text-white/70">
            <span className="text-rawi-yellow font-black">✓</span>{feature}
          </li>
        ))}
      </ul>
      {current ? (
        <button disabled className="mt-6 w-full rounded-full border border-white/[.10] px-5 py-3 text-sm font-extrabold opacity-40 text-white">Current plan</button>
      ) : plan.id !== "free" ? (
        <div className="mt-6"><PlanCheckoutButton plan={plan.id} workspaceId={workspaceId} featured={Boolean(plan.featured)} /></div>
      ) : null}
      {current && currentPlanId !== "free" && (
        <CancelPlanButton workspaceId={workspaceId} />
      )}
    </div>
  );
}
