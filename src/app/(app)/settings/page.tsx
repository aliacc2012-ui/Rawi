import { getCurrentWorkspace } from "@/lib/workspace";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BrandingForm } from "@/components/app-shell/BrandingForm";
import { PlanCheckoutButton } from "@/components/billing/PlanCheckoutButton";
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
  const { data: projectRows } = await supabase
    .from("projects")
    .select("id")
    .eq("workspace_id", workspace!.id);
  const projectIds = (projectRows ?? []).map((p) => p.id);
  let activeGalleries = 0;
  if (projectIds.length) {
    const { count: galleries } = await supabase
      .from("galleries")
      .select("id", { count: "exact", head: true })
      .in("project_id", projectIds)
      .eq("status", "published");
    activeGalleries = galleries ?? 0;
  }
  const usedBytes = workspace!.storage_used_bytes || 0;
  const currentPlan = (workspace!.plan || "free") as PlanId;
  const configuredLimit =
    PLAN_CONFIG[currentPlan]?.storageBytes || PLAN_CONFIG.free.storageBytes;
  const limitBytes = workspace!.storage_limit_bytes || configuredLimit;
  const usedGb = usedBytes / 1024 ** 3,
    limitGb = limitBytes / 1024 ** 3,
    storagePct = Math.min(100, (usedBytes / Math.max(1, limitBytes)) * 100),
    freeGb = Math.max(0, limitGb - usedGb);
  const periodEnd =
    subscription?.status === "active" && subscription.current_period_end
      ? new Date(subscription.current_period_end)
      : null;
  const msLeft = periodEnd ? periodEnd.getTime() - Date.now() : null;
  const daysLeft =
    msLeft !== null
      ? Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)))
      : null;
  const billingWorkspace = workspace as WorkspaceWithBillingSettings;
  const reminderDays = Math.max(
    1,
    Math.min(30, Number(billingWorkspace.renewal_reminder_days ?? 3)),
  );
  const showRenewal =
    currentPlan !== "free" &&
    subscription?.status === "active" &&
    daysLeft !== null &&
    daysLeft <= reminderDays;
  return (
    <div className="max-w-[1500px] mx-auto pb-8">
      <div className="mb-7">
        <span className="text-[11px] font-extrabold tracking-[0.18em] text-gray-400">
          CREATOR WORKSPACE
        </span>
        <h1 className="text-[34px] md:text-[42px] tracking-[-0.05em] leading-none mt-3">
          Branding
        </h1>
        <p className="text-gray-400 mt-2">
          Shape how clients experience your studio before they even see the
          first photo.
        </p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[.9fr_1.1fr] gap-5">
        <div className="bg-white border border-gray-200 rounded-[22px] p-5 md:p-6 shadow-sm self-start">
          <h2 className="text-xl font-bold">Studio identity</h2>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            Update your public studio name and signature accent.
          </p>
          <BrandingForm
            workspaceId={workspace!.id}
            initialName={workspace!.name}
            initialAccent={accent}
          />
        </div>
        <div className="xl:sticky xl:top-6 self-start">
          <div className="bg-white border border-gray-200 rounded-[22px] p-4 shadow-sm">
            <div className="relative overflow-hidden rounded-[18px] min-h-[520px] bg-[radial-gradient(circle_at_68%_52%,rgba(255,212,0,.16),transparent_24%),linear-gradient(145deg,#353535,#080808_60%,#252525)] text-white">
              <div className="relative z-10 p-6 md:p-8 min-h-[520px] flex flex-col justify-between">
                <div className="font-extrabold">
                  {workspace!.name.toUpperCase()}
                </div>
                <div>
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: accent }}
                  >
                    PHOTOGRAPHY
                  </span>
                  <h3 className="text-5xl md:text-6xl tracking-[-.06em] mt-3">
                    Your next client story.
                  </h3>
                  <button
                    className="mt-6 rounded-xl px-5 py-3 text-xs font-extrabold text-black"
                    style={{ backgroundColor: accent }}
                  >
                    View Gallery ↓
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="mt-6 space-y-5">
        {showRenewal && (
          <div className="rounded-[22px] border border-amber-300 bg-amber-50 p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="font-extrabold text-lg">
                Your {PLAN_CONFIG[currentPlan].name} plan expires{" "}
                {daysLeft === 0
                  ? "today"
                  : `in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
                .
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Renew now to keep your{" "}
                {currentPlan === "pro" ? "1 TB" : "250 GB"} storage and paid
                features.
              </p>
            </div>
            <div className="md:min-w-[180px]">
              <PlanCheckoutButton
                plan={currentPlan as "creator" | "pro"}
                workspaceId={workspace!.id}
                featured
              />
            </div>
          </div>
        )}
        <div className="bg-white border border-gray-200 rounded-[24px] p-5 md:p-7 shadow-sm">
          <h2 className="text-[28px] font-bold">Plan & storage</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-7">
            <div>
              <div className="text-[40px] font-extrabold uppercase">
                {workspace!.plan}
              </div>
              {periodEnd && (
                <div className="text-sm text-gray-500 mt-1">
                  Access until{" "}
                  {periodEnd.toLocaleDateString("en-AE", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              )}
              <div className="mt-6">
                <div className="flex justify-between text-xs font-bold">
                  <span>STORAGE USED</span>
                  <span>
                    {usedGb.toFixed(1)} GB /{" "}
                    {limitGb >= 1024
                      ? (limitGb / 1024).toFixed(1) + " TB"
                      : limitGb.toFixed(1) + " GB"}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-[#efefed] mt-3">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${storagePct}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-3">
                  {freeGb >= 1024
                    ? (freeGb / 1024).toFixed(1) + " TB"
                    : freeGb.toFixed(1) + " GB"}{" "}
                  free · {activeGalleries} published galleries
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {PLAN_ORDER.map((id) => (
            <PlanCard
              key={id}
              plan={PLAN_CONFIG[id]}
              current={currentPlan === id}
              workspaceId={workspace!.id}
            />
          ))}
          <CustomPlanCard />
        </div>
      </section>
    </div>
  );
}
function CustomPlanCard() {
  return (
    <div className="relative flex min-h-[390px] flex-col rounded-[22px] border border-gray-200 bg-[linear-gradient(145deg,#171717,#050505)] p-6 text-white">
      <div className="font-extrabold uppercase">Custom</div>
      <div className="mt-5 text-[40px] leading-none tracking-[-.05em]">
        Built for your workflow.
      </div>
      <p className="mt-5 text-sm leading-6 text-white/55">
        Custom storage, team access, gallery volume and support for studios with
        specific requirements.
      </p>
      <ul className="mt-6 space-y-3 text-sm text-white/80">
        <li>✓ Flexible storage</li>
        <li>✓ Multiple team members</li>
        <li>✓ Tailored gallery limits</li>
        <li>✓ Priority support</li>
      </ul>
      <Link
        href="/support?subject=Custom%20RAWI%20plan"
        className="mt-auto block rounded-full bg-rawi-yellow px-5 py-3 text-center text-sm font-extrabold text-black"
      >
        Talk to RAWI
      </Link>
    </div>
  );
}
function PlanCard({
  plan,
  current,
  workspaceId,
}: {
  plan: (typeof PLAN_CONFIG)[PlanId];
  current: boolean;
  workspaceId: string;
}) {
  return (
    <div
      className={`relative bg-white rounded-[22px] p-6 min-h-[390px] ${plan.featured ? "border-2 border-black shadow-sm" : "border border-gray-200"}`}
    >
      {plan.featured && (
        <div className="absolute -top-3 left-5 rounded-full bg-black px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
          Most Popular
        </div>
      )}
      <div className="font-extrabold uppercase">{plan.name}</div>
      <div className="text-[48px] mt-5">
        {plan.priceAed}
        <span className="text-sm text-gray-500">
          {" "}
          AED{plan.priceAed !== 0 ? "/month" : ""}
        </span>
      </div>
      <ul className="mt-6 space-y-3 text-sm">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span className="font-black">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {current ? (
        <button
          disabled
          className="mt-8 w-full rounded-full border px-5 py-3 text-sm font-extrabold opacity-50"
        >
          Current plan
        </button>
      ) : plan.id !== "free" ? (
        <div className="mt-8">
          <PlanCheckoutButton
            plan={plan.id}
            workspaceId={workspaceId}
            featured={Boolean(plan.featured)}
          />
        </div>
      ) : null}
    </div>
  );
}
