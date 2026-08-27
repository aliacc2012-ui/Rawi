"use client";

import { useState } from "react";

type PaidPlan = "creator" | "pro";

export function PlanCheckoutButton({ plan, workspaceId, featured = false }: { plan: PaidPlan; workspaceId: string; featured?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  async function startCheckout() {
    if (loading) return;
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, workspaceId }),
      });
      const result = (await response.json()) as { url?: string; error?: string; code?: string };
      if (!response.ok || !result.url) {
        setMessage(result.code === "BILLING_NOT_CONFIGURED" ? "Billing setup pending — connect Ziina when you're ready." : result.error || "Couldn't start checkout. Try again.");
        return;
      }
      setCheckoutUrl(result.url);
    } catch {
      setMessage("Couldn't connect to the payment page. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checkoutUrl) return <div className="fixed inset-0 z-[100] bg-black/70 p-3 md:p-8"><div className="mx-auto flex h-full max-w-3xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl"><div className="flex items-center justify-between border-b px-5 py-4"><div><div className="text-[10px] font-extrabold tracking-[.16em] text-gray-400">SECURE PAYMENT</div><div className="font-extrabold">RAWI {plan === "creator" ? "Creator" : "Pro"}</div></div><button type="button" onClick={()=>setCheckoutUrl(null)} className="rounded-full border px-4 py-2 text-xs font-extrabold">Close</button></div><iframe src={checkoutUrl} title={`RAWI ${plan} secure payment`} className="min-h-0 flex-1 w-full border-0" allow="payment *" /></div></div>;

  return <div className="mt-6"><button type="button" onClick={startCheckout} disabled={loading} className={`w-full rounded-full px-5 py-3 text-sm font-extrabold transition disabled:cursor-wait disabled:opacity-60 ${featured?"bg-rawi-yellow text-black hover:brightness-95":"border border-gray-300 bg-white hover:bg-gray-50"}`}>{loading?"Opening secure payment…":`Choose ${plan === "creator" ? "Creator" : "Pro"}`}</button>{message&&<p className="mt-2 text-center text-[11px] font-semibold text-amber-700">{message}</p>}</div>;
}
