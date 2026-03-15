"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[120px] w-full rounded-3xl border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel) 82%,white)] px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-[color:var(--muted-foreground)] focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20",
      className
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
