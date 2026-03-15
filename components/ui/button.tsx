"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40 disabled:pointer-events-none disabled:opacity-50 md:transition-none [@media(prefers-reduced-motion:reduce)]:transition-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[color:var(--accent)] text-[color:var(--accent-foreground)] shadow-paper hover:-translate-y-0.5 hover:brightness-105 [@media(prefers-reduced-motion:reduce)]:hover:translate-y-0",
        secondary:
          "border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel) 85%,white)] text-foreground hover:border-[color:var(--accent)]",
        ghost:
          "border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_96%,white)] text-foreground hover:border-[color:var(--accent)] hover:bg-[color:var(--panel-muted)]",
        destructive:
          "border-transparent bg-[color:var(--danger)] text-white hover:brightness-95"
      },
      size: {
        default: "min-h-[44px] h-11 md:min-h-0",
        sm: "min-h-[44px] h-9 px-3 text-xs md:min-h-0",
        lg: "min-h-[48px] h-12 px-5 md:min-h-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    />
  )
);

Button.displayName = "Button";
