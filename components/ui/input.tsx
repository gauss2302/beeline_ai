"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "min-h-[44px] h-11 w-full rounded-2xl border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel) 82%,white)] px-4 text-sm text-foreground outline-none transition placeholder:text-[color:var(--muted-foreground)] focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20 md:min-h-0",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
