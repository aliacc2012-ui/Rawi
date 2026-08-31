"use client";
import { useState, useTransition } from "react";
import { updateGallerySettings } from "@/app/(app)/actions";

type Plan = "free" | "creator" | "pro" | "studio";

const PLAN_COLOR: Record<Plan, string> = {
  free:    "bg-white/5 border border-white/10 text-white/40",
  creator: "bg-rawi-yellow/10 border border-rawi-yellow/25 text-rawi-yellow",
  pro:     "bg-violet-500/10 border border-violet-500/25 text-violet-400",
  studio:  "bg-cyan-500/10 border border-cyan-500/25 text-cyan-400",
};

export function GallerySettings({
  galleryId,
  plan,
  initial,
}: {
  galleryId: string;
  plan: Plan;
  initial: {
    password_enabled: boolean;
    downloads_enabled: boolean;
    favorites_enabled: boolean;
    comments_enabled: boolean;
    branding_enabled: boolean;
    expiry_date: string | null;
  };
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const [password, setPassword] = useState("");
  const [passwordEnabled, setPasswordEnabled] = useState(initial.password_enabled);
  const [downloads, setDownloads] = useState(initial.downloads_enabled);
  const [favorites, setFavorites] = useState(initial.favorites_enabled);
  const [comments, setComments] = useState(initial.comments_enabled);
  const [branding, setBranding] = useState(initial.branding_enabled);
  const paid = plan !== "free";

  function save() {
    setMsg("");
    start(async () => {
      const r = await updateGallerySettings(galleryId, {
        passwordEnabled,
        password,
        downloadsEnabled: downloads,
        favoritesEnabled: favorites,
        commentsEnabled: comments,
        brandingEnabled: branding,
      });
      if ("error" in r && typeof r.error === "string") {
        setMsg(r.error);
      } else {
        setPassword("");
        setMsg("Saved ✓");
      }
    });
  }

  return (
    <div className="rounded-[20px] border border-rawi-line bg-rawi-panel p-5 mt-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="font-cormorant text-[22px] italic font-light text-white leading-tight">
            Gallery controls
          </h3>
          <p className="text-xs text-white/40 mt-1">
            Control client access and delivery options.
          </p>
        </div>
        <span className={`text-[10px] font-extrabold uppercase tracking-widest rounded-full px-2.5 py-1 ${PLAN_COLOR[plan]}`}>
          {plan}
        </span>
      </div>

      {/* Toggles */}
      <div className="space-y-1 divide-y divide-white/[.05]">
        <Toggle
          icon="↓"
          label="Client downloads"
          description="Clients can download their photos"
          checked={downloads}
          onChange={setDownloads}
        />
        <Toggle
          icon="♡"
          label="Client favorites"
          description="Clients can mark favorite shots"
          checked={favorites}
          onChange={setFavorites}
        />
        <Toggle
          icon="◎"
          label="Client comments"
          description="Clients can leave feedback on photos"
          checked={comments}
          onChange={setComments}
          locked={!paid}
        />
        <Toggle
          icon="✦"
          label="Remove RAWI branding"
          description="Hide the RAWI watermark from your gallery"
          checked={!branding}
          onChange={(v) => setBranding(!v)}
          locked={!paid}
        />
        <div className={!paid ? "opacity-50 pointer-events-none" : ""}>
          <Toggle
            icon="🔒"
            label="Password protection"
            description="Require a password to view the gallery"
            checked={passwordEnabled}
            onChange={setPasswordEnabled}
            locked={!paid}
          />
          {passwordEnabled && paid && (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                initial.password_enabled
                  ? "Enter a new password to change it"
                  : "Set gallery password"
              }
              className="mt-3 w-full rounded-xl border border-rawi-line bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-rawi-yellow/40"
            />
          )}
        </div>
      </div>

      {/* Upgrade notice */}
      {!paid && (
        <div className="mt-5 rounded-xl border border-white/[.06] bg-white/[.03] px-4 py-3">
          <p className="text-xs text-white/40 leading-relaxed">
            <span className="text-rawi-yellow/70 font-semibold">Creator or Pro</span>{" "}
            unlocks client comments, password protection, and custom branding removal.
          </p>
        </div>
      )}

      {/* Save row */}
      <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-white/[.06]">
        <span
          className={`text-xs font-bold ${
            msg.includes("✓") ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {msg}
        </span>
        <button
          disabled={pending}
          onClick={save}
          className="rounded-xl bg-rawi-yellow px-5 py-2.5 text-xs font-extrabold text-black tracking-wide disabled:opacity-50 transition-opacity hover:opacity-90"
        >
          {pending ? "Saving…" : "Save controls"}
        </button>
      </div>
    </div>
  );
}

function Toggle({
  icon,
  label,
  description,
  checked,
  onChange,
  locked = false,
}: {
  icon: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  locked?: boolean;
}) {
  return (
    <label
      className={`flex items-center justify-between gap-4 py-3 ${
        locked ? "cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <span className="text-white/30 text-sm mt-0.5 w-4 flex-shrink-0">{icon}</span>
        <div className="min-w-0">
          <span className="block text-sm font-semibold text-white/80">{label}</span>
          <span className="block text-[11px] text-white/30 mt-0.5">{description}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {locked && (
          <span className="text-[9px] font-extrabold tracking-widest uppercase rounded-full bg-rawi-yellow/8 border border-rawi-yellow/20 text-rawi-yellow/70 px-2 py-0.5">
            UPGRADE
          </span>
        )}
        <button
          type="button"
          disabled={locked}
          onClick={() => onChange(!checked)}
          className={`w-11 h-6 rounded-full p-1 transition-colors ${
            checked ? "bg-rawi-yellow" : "bg-white/10"
          } disabled:opacity-40`}
          aria-checked={checked}
          role="switch"
        >
          <span
            className={`block w-4 h-4 rounded-full bg-black transition-transform ${
              checked ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </label>
  );
}
