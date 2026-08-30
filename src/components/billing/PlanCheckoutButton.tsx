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
  const [codeOpen, setCodeOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");

  async function startCheckout() {
    if (loading) return;
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, workspaceId, discountCode }),
      });
      const result = (await response.json()) as {
        url?: string;
        error?: string;
        code?: string;
        activated?: boolean;
      };
      if (result.activated) {
        window.location.assign("/settings?billing=promo");
        return;
      }
      if (!response.ok || !result.url) {
        setMessage(
          result.code === "BILLING_NOT_CONFIGURED"
            ? "Billing setup pending — connect Ziina when you're ready."
            : result.error || "Couldn't start checkout. Try again.",
        );
        return;
      }
      window.location.assign(result.url);
    } catch {
      setMessage("Couldn't connect to Ziina. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setCodeOpen((value) => !value)}
        className="mb-3 text-xs font-bold text-gray-500 underline decoration-gray-300 underline-offset-4"
      >
        Have a discount code?
      </button>
      {codeOpen && (
        <input
          value={discountCode}
          onChange={(event) =>
            setDiscountCode(event.target.value.toUpperCase())
          }
          placeholder="Enter discount code"
          autoComplete="off"
          className="mb-3 h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm font-semibold uppercase tracking-[.08em] outline-none focus:border-black"
        />
      )}
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className={`w-full rounded-full px-5 py-3 text-sm font-extrabold transition disabled:cursor-wait disabled:opacity-60 ${featured ? "bg-rawi-yellow text-black hover:brightness-95" : "border border-gray-300 bg-white hover:bg-gray-50"}`}
      >
        {loading
          ? "Applying…"
          : `Choose ${plan === "creator" ? "Creator" : "Pro"}`}
      </button>
      {message && (
        <p className="mt-2 text-center text-[11px] font-semibold text-amber-700">
          {message}
        </p>
      )}
    </div>
  );
}
