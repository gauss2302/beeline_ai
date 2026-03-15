"use client";

import { Layers3, ScanSearch, Target, TriangleAlert, UsersRound } from "lucide-react";
import { type ProjectNodeKind, type ProjectRecord } from "@/lib/domain/contracts";
import { useWorkspaceStore } from "@/lib/state/workspace-store";
import { ProjectCanvas } from "@/components/canvas/project-canvas";
import { CanvasSidePanel } from "@/components/canvas/canvas-side-panel";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const boardSections: Array<{
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  kinds: ProjectNodeKind[];
}> = [
  { id: "business", label: "Business", icon: Layers3, kinds: ["idea", "problem", "goal", "stakeholder"] },
  { id: "users", label: "Users", icon: UsersRound, kinds: ["user", "stakeholder"] },
  { id: "scope", label: "Scope", icon: Target, kinds: ["feature", "requirement", "constraint"] },
  { id: "risks", label: "Risks", icon: TriangleAlert, kinds: ["risk", "assumption", "open-question"] }
];

export function CanvasBoardScreen({ project }: { project: ProjectRecord }) {
  const selectNode = useWorkspaceStore((state) => state.selectNode);
  const setCanvasPanelTab = useWorkspaceStore((state) => state.setCanvasPanelTab);

  return (
    <div className="flex min-h-[calc(100dvh-14rem)] flex-col gap-4 md:min-h-[calc(100dvh-12rem)]">
      {/* Compact strip: canvas context + panel actions (Mira-style dashboard header) */}
      <Card className="shrink-0 border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_94%,white)] px-4 py-3 md:px-5 md:py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Badge>Canvas Board</Badge>
            <Badge className="border-[color:var(--border)] bg-[color:var(--panel)] text-foreground">
              Hybrid map
            </Badge>
            <span className="hidden text-sm text-[color:var(--muted-foreground)] sm:inline">
              {project.nodes.length} nodes · {project.edges.length} links
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCanvasPanelTab("node")}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_92%,white)] px-4 py-2 text-sm font-semibold transition hover:border-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50"
            >
              <ScanSearch className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Node details</span>
            </button>
            <button
              type="button"
              onClick={() => setCanvasPanelTab("clarify")}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_92%,white)] px-4 py-2 text-sm font-semibold transition hover:border-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50"
            >
              <TriangleAlert className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Clarification</span>
            </button>
            <button
              type="button"
              onClick={() => setCanvasPanelTab("model")}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_92%,white)] px-4 py-2 text-sm font-semibold transition hover:border-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50"
            >
              <Layers3 className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Project model</span>
            </button>
          </div>
        </div>
        {/* Section quick-jump pills */}
        <div className="mt-3 flex flex-wrap gap-2">
          {boardSections.map((section) => {
            const Icon = section.icon;
            const count = project.nodes.filter((node) => section.kinds.includes(node.type)).length;
            const firstNode = project.nodes.find((node) => section.kinds.includes(node.type));
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  if (firstNode) {
                    selectNode(firstNode.id);
                    setCanvasPanelTab("node");
                  }
                }}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] px-3 py-2 text-left transition hover:border-[color:var(--accent)] hover:bg-[color:var(--panel)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50"
              >
                <Icon className="h-4 w-4 shrink-0 text-[color:var(--accent)]" />
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
                  {section.label}
                </span>
                <Badge className="border-[color:var(--border)] bg-[color:var(--panel)] text-foreground">
                  {count}
                </Badge>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Main content: canvas as hero — scrollable when content is tall */}
      <section className="relative min-h-0 w-full flex-1 overflow-auto">
        <ProjectCanvas project={project} />
        <CanvasSidePanel project={project} />
      </section>
    </div>
  );
}
