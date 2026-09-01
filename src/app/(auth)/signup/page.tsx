"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { createClient, SupabaseNotConfiguredError } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = { hidden: { y: 16, opacity: 0 }, visible: { y: 0, opacity: 1 } };

function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  minLength,
  disabled,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        disabled={disabled}
        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:opacity-50 transition"
      />
    </div>
  );
}

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    if (!agreed) { setError("Please accept the Terms and Privacy Policy to continue."); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signUpError) { setError(signUpError.message); return; }
      trackEvent("signup_completed", { method: "email" });
      setSent(true);
    } catch (err) {
      if (err instanceof SupabaseNotConfiguredError) {
        setError("RAWI's backend isn't configured yet in this environment.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const GRID_PHOTOS = [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=200&q=80",
    "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=200&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=200&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=200&q=80",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=200&q=80",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=200&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=200&q=80",
    "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=200&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col md:flex-row">
      {/* ── Left: Form ── */}
      <div className="flex w-full flex-col items-center justify-center bg-white p-8 md:w-1/2">
        <div className="w-full max-w-md">
          {sent ? (
            <motion.div variants={container} initial="hidden" animate="visible" className="flex flex-col gap-6">
              <motion.div variants={item}>
                <Link href="/" className="flex items-center gap-2.5 font-extrabold w-fit">
                  <span className="w-[30px] h-[30px] rounded-[50%_50%_50%_8px] bg-[#F0E050] grid place-items-center text-black font-black -rotate-[8deg] text-sm">R</span>
                  <span className="text-[19px] tracking-[0.12em]">RAWI</span>
                </Link>
              </motion.div>
              <motion.div variants={item}>
                <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
                <p className="text-sm text-gray-500 mt-1">We sent a verification link to <strong>{email}</strong>. Confirm it to activate your RAWI workspace.</p>
              </motion.div>
              <motion.div variants={item}>
                <Link href="/login" className="text-sm font-bold text-black hover:underline">Back to sign in →</Link>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="visible" className="flex flex-col gap-5">
              <motion.div variants={item}>
                <Link href="/" className="flex items-center gap-2.5 font-extrabold w-fit">
                  <span className="w-[30px] h-[30px] rounded-[50%_50%_50%_8px] bg-[#F0E050] grid place-items-center text-black font-black -rotate-[8deg] text-sm">R</span>
                  <span className="text-[19px] tracking-[0.12em]">RAWI</span>
                </Link>
              </motion.div>
              <motion.div variants={item}>
                <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
                <p className="text-sm text-gray-500 mt-1">Start delivering work your clients remember.</p>
              </motion.div>

              {error && (
                <motion.p variants={item} role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                  {error}
                </motion.p>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <motion.div variants={item}>
                  <InputField label="Full name" value={fullName} onChange={setFullName} autoComplete="name" required disabled={loading} />
                </motion.div>
                <motion.div variants={item}>
                  <InputField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" required disabled={loading} />
                </motion.div>
                <motion.div variants={item}>
                  <InputField label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete="new-password" required minLength={8} disabled={loading} />
                </motion.div>
                <motion.div variants={item}>
                  <InputField label="Confirm password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" autoComplete="new-password" required disabled={loading} />
                </motion.div>
                <motion.div variants={item}>
                  <label className="flex items-start gap-2.5 text-xs text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-black" />
                    <span>I agree to the{" "}
                      <Link href="/terms" target="_blank" className="font-semibold text-black underline">Terms</Link>
                      {" "}and{" "}
                      <Link href="/privacy" target="_blank" className="font-semibold text-black underline">Privacy Policy</Link>
                    </span>
                  </label>
                </motion.div>
                <motion.div variants={item}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-full bg-[#F0E050] text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:brightness-105 transition disabled:opacity-60 disabled:cursor-wait"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create account
                  </button>
                </motion.div>
              </form>

              <motion.p variants={item} className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-black hover:underline">Sign in</Link>
              </motion.p>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Right: Visual panel (same as login) ── */}
      <div className="relative hidden w-1/2 md:flex overflow-hidden bg-[#07070f] items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          alt="Cinematic mountain landscape at golden hour"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/80" />

        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
        >
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
            <div className="relative w-[210px] h-[430px] bg-[#111115] rounded-[38px] border border-white/[0.08] shadow-[0_48px_120px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.04)]">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full z-10" />
              <div className="absolute inset-[3px] rounded-[35px] overflow-hidden bg-[#090912]">
                <div className="flex items-center justify-between px-5 pt-5 pb-1">
                  <span className="text-white/50 text-[8px] font-medium">9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-1.5 rounded-[1px] border border-white/40">
                      <div className="w-2 h-full bg-white/70 rounded-[1px]" />
                    </div>
                  </div>
                </div>
                <div className="px-4 pt-2 pb-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[8px] tracking-[0.15em] text-[#C9962A] font-bold">RAWI GALLERY</p>
                      <p className="text-white text-[13px] font-bold mt-0.5 tracking-tight">Venice Wedding</p>
                    </div>
                    <div className="w-7 h-7 rounded-[10px] bg-[#F0E050] flex items-center justify-center">
                      <span className="text-black text-[10px] font-black">R</span>
                    </div>
                  </div>
                  <p className="text-white/30 text-[8px] mt-1">214 photos · Shared by Sarah K.</p>
                </div>
                <div className="grid grid-cols-3 gap-[1.5px] px-[1.5px]">
                  {GRID_PHOTOS.map((src, i) => (
                    <div key={i} className="aspect-square overflow-hidden">
                      <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-[#090912]/95 backdrop-blur border-t border-white/5 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-[8px]">All photos selected</span>
                    <div className="bg-[#F0E050] text-black text-[8px] font-extrabold px-3 py-1.5 rounded-full">Download ↓</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute left-8 top-[34%] flex items-center gap-3 bg-[#1c1c1e]/90 backdrop-blur-xl border border-white/[0.07] rounded-2xl px-4 py-3 w-[210px] shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.1, ease: "easeOut" }}
        >
          <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">✓</div>
          <div>
            <p className="text-white text-[11px] font-semibold leading-tight">Gallery link sent</p>
            <p className="text-white/40 text-[9px] mt-0.5">via WhatsApp · just now</p>
          </div>
        </motion.div>

        <motion.div
          className="absolute right-8 top-[55%] flex items-center gap-3 bg-[#1c1c1e]/90 backdrop-blur-xl border border-white/[0.07] rounded-2xl px-4 py-3 w-[210px] shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.6, ease: "easeOut" }}
        >
          <div className="w-9 h-9 rounded-xl bg-[#C9962A] flex items-center justify-center flex-shrink-0 text-white text-base font-bold">↑</div>
          <div>
            <p className="text-white text-[11px] font-semibold leading-tight">12 files downloaded</p>
            <p className="text-white/40 text-[9px] mt-0.5">Client delivered ✓</p>
          </div>
        </motion.div>

        <div className="absolute bottom-9 left-9 right-9 text-white z-10">
          <p className="text-2xl font-bold leading-tight tracking-tight">
            Your work deserves <span className="text-[#F0E050]">better</span> than a Drive link.
          </p>
          <p className="text-white/45 mt-2 text-sm">Cinematic, branded client galleries — built for creators.</p>
        </div>
      </div>
    </div>
  );
}
