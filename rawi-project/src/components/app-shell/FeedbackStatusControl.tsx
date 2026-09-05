"use client";

import { useState, useTransition } from "react";
import { updateFeedbackStatus } from "@/app/(app)/projects/[id]/feedback-actions";

type FeedbackStatus = "new" | "in_progress" | "resolved";

const options: { value: FeedbackStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

export function FeedbackStatusControl({ projectId, commentId, initialStatus }: { projectId: string; commentId: string; initialStatus: FeedbackStatus }) {
  const [status, setStatus] = useState<FeedbackStatus>(initialStatus);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function change(next: FeedbackStatus) {
    if (next === status || pending) return;
    const previous = status;
    setStatus(next);
    setError("");
    startTransition(async () => {
      const result = await updateFeedbackStatus(projectId, commentId, next);
      if ("error" in result) {
        setStatus(previous);
        setError(result.error ?? "Couldn't update feedback status.");
      }
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={pending}
            onClick={() => change(option.value)}
            className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold transition disabled:opacity-50 ${status === option.value ? "bg-black text-white" : "bg-white text-gray-500 ring-1 ring-gray-200 hover:text-black"}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-1.5 text-[10px] text-red-600">{error}</p>}
    </div>
  );
}
