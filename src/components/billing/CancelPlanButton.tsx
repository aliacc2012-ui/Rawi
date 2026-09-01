"use client";
import { useState } from "react";
import { DestructiveButton } from "@/components/ui/destructive-button";

export function CancelPlanButton({ workspaceId }: { workspaceId: string }) {
  const [stage, setStage] = useState<"idle" | "confirm" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (stage === "idle") {
      setStage("confirm");
      return;
    }
    if (stage === "confirm") {
      setStage("loading");
      setError(null);
      try {
        const res = await fetch("/api/billing/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceId }),
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          setError(data.error ?? "Something went wrong.");
          setStage("confirm");
          return;
        }
        setStage("done");
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        setError("Network error. Try again.");
        setStage("confirm");
      }
    }
  }

  if (stage === "done") {
    return <p className="mt-4 text-center text-xs text-emerald-400 font-semibold">Cancelled — your plan stays active until the period ends.</p>;
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <DestructiveButton
        onClick={handleClick}
        disabled={stage === "loading"}
        className={stage === "loading" ? "opacity-50 cursor-wait" : ""}
      >
        {stage === "idle" && "Cancel plan"}
        {stage === "confirm" && "Tap again to confirm cancellation"}
        {stage === "loading" && "Cancelling…"}
      </DestructiveButton>
      {stage === "confirm" && (
        <button
          onClick={() => setStage("idle")}
          className="text-[11px] text-white/30 hover:text-white/60 transition"
        >
          Never mind
        </button>
      )}
      {error && <p className="text-[11px] text-red-400 font-semibold">{error}</p>}
    </div>
  );
}
