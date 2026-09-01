"use client";

import { useState } from "react";
import NumberFlow from "@number-flow/react";
import { PLAN_CONFIG, PLAN_ORDER, type PlanId } from "@/lib/plans";
import { PlanCheckoutButton } from "@/components/billing/PlanCheckoutButton";
import { CancelPlanButton } from "@/components/billing/CancelPlanButton";
import Link from "next/link";

const AED_TO_USD = 0.2723; // fixed peg ~3.6725 AED = $1

function usdLabel(aed: number): string {
  const usd = Math.round(aed * AED_TO_USD);
  return `~$${usd}`;
}

export function PricingSection({
  currentPlanId,
  workspaceId,
}: {
  currentPlanId: PlanId;
  workspaceId: string;
}) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <span className={`text-sm font-bold transition ${billing === "monthly" ? "text-white" : "text-white/40"}`}>Monthly</span>
        <button
          type="button"
          onClick={() => setBilling(billing === "monthly" ? "annual" : "monthly")}
          className="relative w-12 h-6 rounded-full transition-colors focus:outline-none"
          style={{ background: billing === "annual" ? "#FFD400" : "rgba(255,255,255,0.12)" }}
          aria-label="Toggle billing period"
        >
          <span
            className="absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200"
            style={{ transform: billing === "annual" ? "translateX(24px)" : "translateX(0)" }}
          />
        </button>
        <span className={`text-sm font-bold transition ${billing === "annual" ? "text-white" : "text-white/40"}`}>
          Annual
          <span className="ml-1.5 rounded-full bg-emerald-400/20 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 tracking-wide">-15%</span>
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {PLAN_ORDER.map((id) => {
          const plan = PLAN_CONFIG[id];
          const current = currentPlanId === id;
          const monthlyAed = plan.priceAed;
          const annualMonthlyAed = billing === "annual" ? Math.round(monthlyAed * 0.85) : monthlyAed;
          const annualTotalAed = billing === "annual" ? Math.round(monthlyAed * 12 * 0.85) : monthlyAed;

          return (
            <div
              key={id}
              className={`relative flex flex-col min-h-[390px] rounded-[22px] p-6 overflow-hidden ${plan.featured ? "border-2 border-rawi-yellow bg-rawi-yellow/[.04]" : "border border-white/[.07] bg-rawi-panel"}`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-5 rounded-full bg-rawi-yellow px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-black">Most Popular</div>
              )}
              <div className="text-[10px] font-extrabold tracking-widest text-white/35 mb-4">{plan.name.toUpperCase()}</div>

              {/* Price */}
              {monthlyAed === 0 ? (
                <div className="font-cormorant text-[52px] leading-none tracking-[-0.03em] text-[#F0EFFF]">
                  Free
                </div>
              ) : (
                <div>
                  <div className="flex items-end gap-1.5">
                    <NumberFlow
                      value={annualMonthlyAed}
                      className="font-cormorant text-[52px] leading-none tracking-[-0.03em] text-[#F0EFFF] tabular-nums"
                    />
                    <div className="mb-1.5">
                      <div className="text-sm font-sans text-white/35">AED/mo</div>
                      <div className="text-[11px] font-semibold text-white/30">{usdLabel(annualMonthlyAed)}/mo</div>
                    </div>
                  </div>
                  {billing === "annual" && (
                    <div className="mt-1 text-[11px] text-emerald-400 font-semibold">
                      Billed {annualTotalAed} AED/year · saves {Math.round(monthlyAed * 12 * 0.15)} AED
                    </div>
                  )}
                  {billing === "monthly" && (
                    <div className="mt-1 text-[11px] text-white/25 font-semibold">
                      {usdLabel(monthlyAed)} · billed monthly
                    </div>
                  )}
                </div>
              )}

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
                <div className="mt-6">
                  <PlanCheckoutButton
                    plan={plan.id}
                    workspaceId={workspaceId}
                    featured={Boolean(plan.featured)}
                    billing={billing}
                  />
                </div>
              ) : null}
              {current && currentPlanId !== "free" && (
                <CancelPlanButton workspaceId={workspaceId} />
              )}
            </div>
          );
        })}

        {/* Custom card */}
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
      </div>
    </div>
  );
}
