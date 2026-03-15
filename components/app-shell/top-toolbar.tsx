"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileOutput, KanbanSquare, LayoutDashboard, LoaderCircle, Network, Presentation, Sparkles } from "lucide-react";
import { type ProjectRecord } from "@/lib/domain/contracts";
import { deriveProjectAnalytics } from "@/lib/domain/analytics";
import { useWorkspaceStore, type WorkspaceView } from "@/lib/state/workspace-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { projectViewHref } from "@/lib/routes";

const views: Array<{ value: WorkspaceView; label: string; shortLabel: string; icon: React.ComponentType<{ className?: string }> }> = [
  { value: "overview", label: "Overview", shortLabel: "Overview", icon: LayoutDashboard },
  { value: "canvas", label: "Canvas Board", shortLabel: "Canvas", icon: Network },
  { value: "artifacts", label: "Artifacts", shortLabel: "Artifacts", icon: FileOutput },
  { value: "backlog", label: "Backlog", shortLabel: "Backlog", icon: KanbanSquare },
  { value: "presentation", label: "Review", shortLabel: "Review", icon: Presentation }
];

export function TopToolbar({
  project,
  currentView
}: {
  project: ProjectRecord;
  currentView: WorkspaceView;
}) {
  const router = useRouter();
  const generateArtifact = useWorkspaceStore((state) => state.generateArtifact);
  const requestClarification = useWorkspaceStore((state) => state.requestClarification);
  const syncProjectModel = useWorkspaceStore((state) => state.syncProjectModel);
  const setCanvasPanelTab = useWorkspaceStore((state) => state.setCanvasPanelTab);
  const saving = useWorkspaceStore((state) => state.saving);
  const analytics = deriveProjectAnalytics(project);

  const workflowSteps = [
    { id: "idea", label: "Idea", done: Boolean(project.idea.trim()) },
    { id: "map", label: "Map", done: project.nodes.length > 1 },
    { id: "clarify", label: "Clarify", done: project.clarificationQuestions.length === 0 },
    {
      id: "structure",
      label: "Structure",
      done: project.model.targetUsers.length > 0 && project.model.functionalRequirements.length >= 3
    },
    { id: "document", label: "Doc", done: project.artifacts.length > 0 }
  ];

  return (
    <header className="border-b border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_94%,white)] px-3 py-2 md:px-4 md:py-3">
      <div className="flex flex-col gap-2">
        {/* Main row: title + status, then tabs + actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="truncate font-display text-lg leading-tight md:text-xl">
              {project.title}
            </h1>
            <Badge className="shrink-0 border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_92%,white)] text-foreground">
              {analytics.readinessScore}% ready
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex flex-wrap gap-0.5 rounded-full border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-0.5" aria-label="Views">
              {views.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.value}
                    href={projectViewHref(project.id, item.value)}
                    className={cn(
                      "flex min-h-[40px] items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50 sm:min-h-0",
                      currentView === item.value
                        ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]"
                        : "text-[color:var(--muted-foreground)] hover:text-foreground"
                    )}
                    title={item.label}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden sm:inline">{item.shortLabel}</span>
                  </Link>
                );
              })}
            </nav>
            {currentView === "canvas" ? (
              <>
                <Button variant="secondary" size="sm" onClick={() => setCanvasPanelTab("clarify")} className="shrink-0">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Clarify</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setCanvasPanelTab("model")} className="shrink-0 hidden sm:inline-flex">
                  Model
                </Button>
                <Button variant="ghost" size="sm" onClick={() => void syncProjectModel()} className="shrink-0 hidden sm:inline-flex">
                  Sync
                </Button>
              </>
            ) : null}
            {currentView === "overview" ? (
              <>
                <Button variant="secondary" size="sm" onClick={() => router.push(projectViewHref(project.id, "canvas"))} className="shrink-0">
                  Canvas
                </Button>
                <Button variant="ghost" size="sm" onClick={() => void requestClarification()} className="shrink-0 hidden sm:inline-flex">
                  Clarify
                </Button>
              </>
            ) : null}
            {currentView === "artifacts" ? (
              <>
                <Button variant="secondary" size="sm" onClick={() => void generateArtifact("brd")} className="shrink-0">BRD</Button>
                <Button variant="ghost" size="sm" onClick={() => void generateArtifact("prd")} className="shrink-0">PRD</Button>
              </>
            ) : null}
            {currentView === "backlog" ? (
              <>
                <Button variant="secondary" size="sm" onClick={() => void generateArtifact("user-stories")} className="shrink-0">
                  <KanbanSquare className="h-3.5 w-3.5" />
                  Stories
                </Button>
                <Button variant="ghost" size="sm" onClick={() => void generateArtifact("acceptance-criteria")} className="shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Criteria
                </Button>
              </>
            ) : null}
            {currentView === "presentation" ? (
              <Button variant="secondary" size="sm" onClick={() => router.push(projectViewHref(project.id, "artifacts"))} className="shrink-0">
                <FileOutput className="h-3.5 w-3.5" />
                Docs
              </Button>
            ) : null}
            <span title={saving ? "Syncing" : "Ready"}>
              <Badge className="shrink-0 border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_92%,white)] text-foreground">
                {saving ? <LoaderCircle className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3 text-[color:var(--accent)]" />}
              </Badge>
            </span>
          </div>
        </div>
        {/* Compact workflow steps */}
        <div className="flex flex-wrap items-center gap-1.5">
          {workflowSteps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "inline-flex min-h-[32px] items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-wider sm:min-h-0",
                step.done
                  ? "border-[color:oklch(0.79_0.08_145)] bg-[color:oklch(0.94_0.04_145)] text-[color:oklch(0.39_0.07_145)]"
                  : "border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_92%,white)] text-[color:var(--muted-foreground)]"
              )}
              title={step.label}
            >
              <span className="text-[10px] opacity-80">{index + 1}</span>
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
