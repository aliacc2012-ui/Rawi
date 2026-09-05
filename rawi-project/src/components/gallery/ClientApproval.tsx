"use client";

import { useState, useTransition } from "react";
import { approveGalleryDelivery } from "@/app/g/[slug]/actions";

export function ClientApproval({ galleryId, initialApproval }: { galleryId: string; initialApproval: { client_name: string; approved_at: string } | null }) {
  const [approval, setApproval] = useState(initialApproval);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  if (approval) {
    return <section className="border-t border-black/10 bg-white px-5 py-14"><div className="mx-auto max-w-3xl rounded-[24px] border border-emerald-200 bg-emerald-50 p-7 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-600 text-xl font-black text-white">✓</div><h2 className="mt-4 text-2xl font-semibold tracking-[-.035em]">Delivery approved</h2><p className="mt-2 text-sm text-black/55">Thank you, {approval.client_name}. Your approval has been recorded.</p><p className="mt-3 text-xs font-bold uppercase tracking-[.12em] text-emerald-700">{new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(approval.approved_at))}</p></div></section>;
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await approveGalleryDelivery(galleryId, name);
      if ("error" in result) {
        setError(typeof result.error === "string" ? result.error : "Couldn't record your approval. Please try again.");
        return;
      }
      setApproval({ client_name: result.clientName, approved_at: result.approvedAt });
    });
  }

  return <section className="border-t border-black/10 bg-white px-5 py-14"><div className="mx-auto max-w-3xl rounded-[24px] bg-black p-7 text-white md:p-9"><span className="text-[10px] font-extrabold tracking-[.18em] text-[#FFD400]">FINAL DELIVERY</span><h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Everything looks good?</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/55">Confirm that you have reviewed this gallery and approve the delivered work.</p><form onSubmit={submit} className="mt-7 flex flex-col gap-3 sm:flex-row"><input required maxLength={120} value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your name" className="h-12 flex-1 rounded-xl border border-white/15 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#FFD400]/70"/><button disabled={pending || !name.trim()} className="h-12 rounded-xl bg-[#FFD400] px-5 text-sm font-extrabold text-black disabled:opacity-50">{pending ? "Approving…" : "Approve delivery ✓"}</button></form><div className="min-h-6 pt-2 text-sm text-red-300" role="status">{error}</div><p className="mt-2 text-[11px] text-white/30">Your name and approval time will be shared with the creator.</p></div></section>;
}
