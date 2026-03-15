"use client";

import { type Node, Handle, NodeProps, Position } from "@xyflow/react";
import { Sparkles } from "lucide-react";
import { useWorkspaceStore } from "@/lib/state/workspace-store";
import { type ProjectNodeKind } from "@/lib/domain/contracts";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const nodeToneMap: Record<ProjectNodeKind, string> = {
  idea: "from-[oklch(0.85_0.08_60)] to-[oklch(0.97_0.02_85)]",
  problem: "from-[oklch(0.82_0.08_28)] to-[oklch(0.97_0.01_80)]",
  user: "from-[oklch(0.87_0.05_165)] to-[oklch(0.97_0.01_80)]",
  stakeholder: "from-[oklch(0.88_0.04_250)] to-[oklch(0.97_0.01_80)]",
  goal: "from-[oklch(0.9_0.07_110)] to-[oklch(0.97_0.01_80)]",
  feature: "from-[oklch(0.87_0.07_42)] to-[oklch(0.97_0.01_80)]",
  requirement: "from-[oklch(0.88_0.06_80)] to-[oklch(0.97_0.01_80)]",
  constraint: "from-[oklch(0.89_0.04_95)] to-[oklch(0.97_0.01_80)]",
  risk: "from-[oklch(0.86_0.07_24)] to-[oklch(0.97_0.01_80)]",
  metric: "from-[oklch(0.88_0.05_150)] to-[oklch(0.97_0.01_80)]",
  assumption: "from-[oklch(0.9_0.04_300)] to-[oklch(0.97_0.01_80)]",
  "open-question": "from-[oklch(0.9_0.05_45)] to-[oklch(0.97_0.01_80)]"
};

export function PlanningNode({
  id,
  data,
  selected
}: NodeProps<
  Node<{
  type: ProjectNodeKind;
  title: string;
  description: string;
  }, "planning">
>) {
  const selectNode = useWorkspaceStore((state) => state.selectNode);
  const expandNode = useWorkspaceStore((state) => state.expandNode);
  const saving = useWorkspaceStore((state) => state.saving);

  return (
    <div
      className={cn(
        "min-w-[200px] max-w-[280px] rounded-[1.5rem] border bg-gradient-to-br p-3 text-left shadow-paper transition sm:min-w-[240px] sm:p-4",
        nodeToneMap[data.type],
        selected
          ? "border-[color:var(--accent)] ring-2 ring-[color:color-mix(in_oklab,var(--accent) 35%,transparent)]"
          : "border-[color:var(--border)] hover:border-[color:var(--accent)]"
      )}
      onClick={() => selectNode(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          selectNode(id);
        }
      }}
    >
      <Handle type="target" position={Position.Top} className="!h-3 !w-3 !border-0 !bg-[color:var(--accent)]" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Badge className="bg-[color:color-mix(in_oklab,var(--panel)_92%,white)] text-[color:var(--foreground)]">{data.type.replace("-", " ")}</Badge>
          <h3 className="mt-2 truncate font-display text-base font-semibold leading-tight sm:mt-3 sm:text-[1.15rem]">{data.title}</h3>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            void expandNode(id);
          }}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_92%,white)] text-[color:var(--foreground)] transition hover:-translate-y-0.5 hover:bg-[color:var(--panel)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50"
          disabled={saving}
          aria-label="Expand node"
        >
          <Sparkles className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[color:color-mix(in_oklab,var(--foreground) 78%,white)]">
        {data.description || "Refine this node with more business context."}
      </p>
      <Handle type="source" position={Position.Bottom} className="!h-3 !w-3 !border-0 !bg-[color:var(--foreground)]" />
    </div>
  );
}
