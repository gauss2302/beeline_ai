import { cn } from "@/lib/utils";

export function Card({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] p-4 shadow-paper md:rounded-[1.75rem] md:p-5",
        className
      )}
    >
      {children}
    </section>
  );
}
