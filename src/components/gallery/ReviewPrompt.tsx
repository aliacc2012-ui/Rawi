"use client";

import { useState, useTransition } from "react";
import { submitGalleryReview } from "@/app/g/[slug]/actions";

export function ReviewPrompt({
  galleryId,
  clientName,
  open,
  onClose,
}: {
  galleryId: string;
  clientName?: string;
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState(clientName ?? "");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  if (!open) return null;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    startTransition(async () => {
      const result = await submitGalleryReview(galleryId, name, rating, review);
      if ("error" in result) {
        setMessage(result.error ?? "Couldn't save your review.");
        return;
      }
      setMessage("Thank you — your review was sent ✓");
      setTimeout(onClose, 900);
    });
  }

  return (
    <div
      className="fixed inset-0 z-[140] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-[24px] bg-white p-6 text-black shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold tracking-[.16em] text-[#b59600]">
              A QUICK REVIEW
            </span>
            <h3 className="mt-1 text-2xl font-semibold tracking-[-.03em]">
              Enjoyed your gallery?
            </h3>
            <p className="mt-2 text-sm leading-6 text-black/50">
              Your feedback helps the creator grow.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close review"
            className="grid h-9 w-9 place-items-center rounded-full bg-black/5"
          >
            ×
          </button>
        </div>
        <div
          className="mt-5 flex gap-2"
          aria-label={`${rating} out of 5 stars`}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              aria-label={`${star} star${star === 1 ? "" : "s"}`}
              className={`text-3xl ${star <= rating ? "text-[#FFD400]" : "text-black/15"}`}
            >
              ★
            </button>
          ))}
        </div>
        <input
          required
          maxLength={120}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          className="mt-5 h-11 w-full rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-black"
        />
        <textarea
          required
          maxLength={1000}
          rows={4}
          value={review}
          onChange={(event) => setReview(event.target.value)}
          placeholder="What did you enjoy about the experience?"
          className="mt-3 w-full resize-none rounded-xl border border-black/10 p-3 text-sm outline-none focus:border-black"
        />
        {message && (
          <p
            className={`mt-3 text-xs font-bold ${message.includes("✓") ? "text-emerald-600" : "text-red-600"}`}
          >
            {message}
          </p>
        )}
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-black/40"
          >
            Maybe later
          </button>
          <button
            disabled={pending}
            className="rounded-xl bg-black px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50"
          >
            {pending ? "Sending…" : "Send review"}
          </button>
        </div>
      </form>
    </div>
  );
}
