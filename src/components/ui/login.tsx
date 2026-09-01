"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  rememberMe: z.boolean().default(false).optional(),
});

export type LoginFormValues = z.infer<typeof formSchema>;

interface AuthFormSplitScreenProps {
  logo: React.ReactNode;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  onSubmit: (data: LoginFormValues) => Promise<void>;
  forgotPasswordHref: string;
  createAccountHref: string;
  submitError?: string | null;
  onOAuthSignIn?: (provider: "google" | "azure") => Promise<void>;
  oauthError?: string | null;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.4 2H2v9.4h9.4V2z" fill="#F25022"/>
      <path d="M22 2h-9.4v9.4H22V2z" fill="#7FBA00"/>
      <path d="M11.4 12.6H2V22h9.4v-9.4z" fill="#00A4EF"/>
      <path d="M22 12.6h-9.4V22H22v-9.4z" fill="#FFB900"/>
    </svg>
  );
}

// Paper plane SVG that looks like a "send / email sent" icon
function PaperPlane({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M60 4L4 26l22 8 8 22 10-20 16-32z"
        fill="white"
        fillOpacity="0.9"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M26 34l10-10"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
    </svg>
  );
}

export function AuthFormSplitScreen({
  logo,
  title,
  description,
  imageSrc,
  imageAlt,
  onSubmit,
  forgotPasswordHref,
  createAccountHref,
  submitError,
  onOAuthSignIn,
  oauthError,
}: AuthFormSplitScreenProps) {
  const [oauthLoading, setOauthLoading] = React.useState<"google" | "azure" | null>(null);

  async function handleOAuth(provider: "google" | "azure") {
    if (!onOAuthSignIn || oauthLoading) return;
    setOauthLoading(provider);
    try {
      await onOAuthSignIn(provider);
    } finally {
      setOauthLoading(null);
    }
  }
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const handleFormSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch {
      // errors surfaced via submitError prop
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col md:flex-row">
      {/* Left: Form */}
      <div className="flex w-full flex-col items-center justify-center bg-white p-8 md:w-1/2">
        <div className="w-full max-w-md">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            <motion.div variants={itemVariants} className="mb-2">
              {logo}
            </motion.div>
            <motion.div variants={itemVariants}>
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            </motion.div>

            {submitError && (
              <motion.p
                variants={itemVariants}
                role="alert"
                className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5"
              >
                {submitError}
              </motion.p>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Remember me</FormLabel>
                      </FormItem>
                    )}
                  />
                  <a href={forgotPasswordHref} className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
                    Forgot password?
                  </a>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#F0E050] text-black font-extrabold rounded-full hover:brightness-105 border-0 h-11"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign in
                  </Button>
                </motion.div>
              </form>
            </Form>

            {onOAuthSignIn && (
              <motion.div variants={itemVariants} className="flex flex-col gap-3">
                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">or continue with</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                {oauthError && (
                  <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5 text-center">
                    {oauthError}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleOAuth("google")}
                    disabled={!!oauthLoading}
                    className="flex items-center justify-center gap-2 h-11 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {oauthLoading === "google" ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : (
                      <GoogleIcon />
                    )}
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOAuth("azure")}
                    disabled={!!oauthLoading}
                    className="flex items-center justify-center gap-2 h-11 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {oauthLoading === "azure" ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : (
                      <MicrosoftIcon />
                    )}
                    Microsoft
                  </button>
                </div>
              </motion.div>
            )}

            <motion.p variants={itemVariants} className="text-center text-sm text-gray-500">
              New to RAWI?{" "}
              <a href={createAccountHref} className="font-bold text-black hover:underline">
                Create an account
              </a>
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Right: Visual showcase */}
      <div className="relative hidden w-1/2 md:flex overflow-hidden bg-[#07070f] items-center justify-center">
        {/* Subtle background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageSrc} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/80" />

        {/* Center: Floating phone mockup */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Phone frame */}
            <div className="relative w-[210px] h-[430px] bg-[#111115] rounded-[38px] border border-white/[0.08] shadow-[0_48px_120px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.04)]">
              {/* Dynamic island */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full z-10" />
              {/* Screen */}
              <div className="absolute inset-[3px] rounded-[35px] overflow-hidden bg-[#090912]">
                {/* Status bar */}
                <div className="flex items-center justify-between px-5 pt-5 pb-1">
                  <span className="text-white/50 text-[8px] font-medium">9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-1.5 rounded-[1px] border border-white/40">
                      <div className="w-2 h-full bg-white/70 rounded-[1px]" />
                    </div>
                  </div>
                </div>
                {/* Gallery header */}
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
                {/* Photo grid */}
                <div className="grid grid-cols-3 gap-[1.5px] px-[1.5px]">
                  {[
                    "https://images.unsplash.com/photo-1519741497674-611481863552?w=200&q=80",
                    "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=200&q=80",
                    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=200&q=80",
                    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=200&q=80",
                    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=200&q=80",
                    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=200&q=80",
                    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=200&q=80",
                    "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=200&q=80",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
                  ].map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <div key={i} className="aspect-square overflow-hidden">
                      <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
                {/* Download bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-[#090912]/95 backdrop-blur border-t border-white/5 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-[8px]">All photos selected</span>
                    <div className="bg-[#F0E050] text-black text-[8px] font-extrabold px-3 py-1.5 rounded-full">
                      Download ↓
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* iOS notification: Gallery link sent */}
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

        {/* iOS notification: 12 files downloaded */}
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

        {/* Paper plane arc */}
        <motion.div
          className="absolute"
          initial={{ x: "8%", y: "72%", rotate: -20, opacity: 0 }}
          animate={{
            x: ["8%", "28%", "52%", "78%", "105%"],
            y: ["72%", "52%", "32%", "16%", "-8%"],
            rotate: [-20, -28, -34, -40, -46],
            opacity: [0, 1, 1, 0.7, 0],
          }}
          transition={{ duration: 3.4, ease: "easeInOut", repeat: Infinity, repeatDelay: 3 }}
        >
          <PaperPlane className="w-9 h-9 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        </motion.div>

        {/* Bottom tagline */}
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
