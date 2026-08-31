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
}: AuthFormSplitScreenProps) {
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
