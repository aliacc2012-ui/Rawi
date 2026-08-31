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

      {/* Right: Image + paper plane animation */}
      <div className="relative hidden w-1/2 md:block overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageSrc} alt={imageAlt} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Paper plane flight path */}
        <motion.div
          className="absolute"
          initial={{ x: "10%", y: "75%", rotate: -20, opacity: 0 }}
          animate={{
            x: ["10%", "30%", "55%", "80%", "100%"],
            y: ["75%", "55%", "35%", "18%", "-5%"],
            rotate: [-20, -25, -30, -35, -40],
            opacity: [0, 1, 1, 0.8, 0],
          }}
          transition={{
            duration: 3.2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 2.4,
          }}
        >
          <PaperPlane className="w-10 h-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
        </motion.div>

        {/* Trail dots */}
        {[0.4, 0.7, 1.1].map((delay, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/60"
            style={{ width: 5 - i, height: 5 - i }}
            initial={{ x: "10%", y: "75%", opacity: 0 }}
            animate={{
              x: ["10%", "30%", "55%", "80%", "100%"],
              y: ["75%", "55%", "35%", "18%", "-5%"],
              opacity: [0, 0.5, 0.3, 0.1, 0],
            }}
            transition={{
              duration: 3.2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 2.4,
              delay,
            }}
          />
        ))}

        {/* "Gallery link sent ✓" badge */}
        <motion.div
          className="absolute bottom-24 left-8 flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -6] }}
          transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 2.4, delay: 2.0 }}
        >
          <span className="text-[#F0E050] text-base">✈</span>
          <span className="text-white text-sm font-medium">Gallery link sent</span>
          <span className="text-green-400 text-sm font-bold">✓</span>
        </motion.div>

        {/* Bottom tagline */}
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-3xl font-bold leading-tight tracking-tight">
            Your work deserves <span className="text-[#F0E050]">better</span> than a Drive link.
          </p>
          <p className="text-white/60 mt-2 text-sm">Cinematic, branded client galleries — built for creators.</p>
        </div>
      </div>
    </div>
  );
}
