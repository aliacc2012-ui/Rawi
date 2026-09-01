"use client";
import { useState, useTransition, useRef } from "react";
import { addGalleryComment } from "@/app/g/[slug]/actions";

type Comment = { id: string; client_name: string; comment_text: string; media_id: string | null; created_at: string };

export function ClientComments({ galleryId, initialComments = [] }: { galleryId: string; initialComments?: Comment[] }) {
  const [name, setName] = useState(initialComments[0]?.client_name ?? "");
  const [text, setText] = useState("");
  const [comments, setComments] = useState(initialComments.filter((c) => !c.media_id));
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const r = await addGalleryComment(galleryId, name, text);
      if ("error" in r) { setError(r.error ?? "Couldn't send your feedback."); return; }
      setComments((c) => [r.comment, ...c]);
      setText("");
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    });
  }

  return (
    <section className="bg-[#f6f5f2] px-4 pb-16 pt-4">
      <div
        className="mx-auto max-w-3xl rounded-3xl border border-black/[.07] bg-white p-7 shadow-sm md:p-10"
        style={{ animation: "fadeUp .5s ease both" }}
      >
        <style>{`
          @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
          @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
          @keyframes pop { 0%,100% { transform: scale(1); } 50% { transform: scale(1.12); } }
          .feedback-input { transition: border-color .18s, box-shadow .18s; }
          .feedback-input:focus { border-color: #111; box-shadow: 0 0 0 3px rgba(0,0,0,.06); outline: none; }
          .comment-item { animation: slideIn .3s ease both; }
          .send-btn { transition: transform .15s, background .15s; }
          .send-btn:not(:disabled):hover { transform: translateY(-1px); }
          .send-btn:not(:disabled):active { transform: scale(.97); }
        `}</style>

        {/* Header */}
        <div className="mb-6">
          <span className="text-[10px] font-extrabold tracking-[.18em] text-[#b59600]">CLIENT FEEDBACK</span>
          <p className="mt-3 text-sm leading-relaxed text-black/45">
            Share general feedback about this delivery. You can also comment directly on individual photos or videos.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-3">
          <input
            required
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="feedback-input h-12 w-full rounded-2xl border border-black/[.10] bg-[#fafafa] px-4 text-sm"
          />
          <div className="relative">
            <textarea
              ref={textareaRef}
              required
              maxLength={2000}
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your feedback…"
              className="feedback-input w-full resize-none rounded-2xl border border-black/[.10] bg-[#fafafa] p-4 pb-8 text-sm"
            />
            <span className="absolute bottom-3 left-4 text-[10px] text-black/25">{text.length}/2000</span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-xs text-red-500">{error}</span>
            <button
              type="submit"
              disabled={pending || !name.trim() || !text.trim()}
              className={`send-btn flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-extrabold text-white disabled:opacity-40 ${sent ? "bg-emerald-500" : "bg-black"}`}
            >
              {pending ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Sending…
                </>
              ) : sent ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l4 4 6-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Sent!
                </>
              ) : (
                <>Send feedback <span aria-hidden>→</span></>
              )}
            </button>
          </div>
        </form>

        {/* Previous comments */}
        {comments.length > 0 && (
          <div className="mt-8 space-y-3 border-t border-black/[.07] pt-6">
            <p className="text-[10px] font-extrabold tracking-widest text-black/30">PREVIOUS FEEDBACK</p>
            {comments.map((c) => (
              <div key={c.id} className="comment-item rounded-2xl bg-[#f7f6f3] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold">{c.client_name}</span>
                  <span className="text-[10px] text-black/30">
                    {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(c.created_at))}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-black/55">{c.comment_text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
