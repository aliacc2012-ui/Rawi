"use client";

import { useState } from "react";

type PaidPlan = "creator" | "pro";

export function PlanCheckoutButton({
  plan,
  workspaceId,
  featured = false,
}: {
  plan: PaidPlan;
  workspaceId: string;
  featured?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
        setMessage(
          result.code === "BILLING_NOT_CONFIGURED"
            ? "Billing setup pending — connect Stripe when you're ready."
            : result.error || "Couldn't start checkout. Try again."
        );
        return;
      }

      window.location.assign(result.url);
    } catch {
      setMessage("Couldn't connect to billing. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className={`w-full rounded-full px-5 py-3 text-sm font-extrabold transition disabled:cursor-wait disabled:opacity-60 ${
          featured
            ? "bg-rawi-yellow text-black hover:brightness-95"
            : "border border-gray-300 bg-white hover:bg-gray-50"
        }`}
      >
        {loading ? "Opening checkout…" : `Choose ${plan === "creator" ? "Creator" : "Pro"}`}
      </button>
      {message && <p className="mt-2 text-center text-[11px] font-semibold text-amber-700">{message}</p>}
    </div>
  );
}
