import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-black/10 bg-black/5 px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 ring-offset-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rawi-yellow/60 focus-visible:ring-offset-0 focus-visible:border-rawi-yellow/60 disabled:cursor-not-allowed disabled:opacity-50 transition dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
