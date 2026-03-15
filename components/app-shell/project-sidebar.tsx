"use client";

import { useMemo, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  FileOutput,
  FolderKanban,
  KanbanSquare,
  LayoutDashboard,
  Network,
  Plus,
  Presentation,
  X
} from "lucide-react";
import { useWorkspaceStore, type WorkspaceView } from "@/lib/state/workspace-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn, relativeTime } from "@/lib/utils";
import { defaultProjectHref, projectViewHref } from "@/lib/routes";

const ideaPresets = [
  "We need a leave approval system for managers, HR, and employees",
  "We want an internal finance dashboard with approvals, variance analysis, and audit trails",
  "We need a platform for hackathon participants, judges, and organizers",
  "We need a vendor onboarding workflow with compliance checks and decision tracking"
];

const navigationItems: Array<{
  view: WorkspaceView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { view: "overview", label: "Overview", icon: LayoutDashboard },
  { view: "canvas", label: "Canvas", icon: Network },
  { view: "artifacts", label: "Artifacts", icon: FileOutput },
  { view: "backlog", label: "Backlog", icon: KanbanSquare },
  { view: "presentation", label: "Review", icon: Presentation }
];

export function ProjectSidebar({
  currentView,
  currentProjectId
}: {
  currentView?: WorkspaceView;
  currentProjectId?: string | null;
}) {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const projects = useWorkspaceStore((state) => state.projects);
  const activeProjectId = useWorkspaceStore((state) => state.activeProjectId);
  const saving = useWorkspaceStore((state) => state.saving);
  const projectsWidgetOpen = useWorkspaceStore((state) => state.projectsWidgetOpen);
  const createProject = useWorkspaceStore((state) => state.createProject);
  const selectProject = useWorkspaceStore((state) => state.selectProject);
  const toggleProjectsWidget = useWorkspaceStore((state) => state.toggleProjectsWidget);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? null,
    [projects, activeProjectId]
  );

  return (
    <aside className="relative flex w-full flex-col items-center justify-between border-r border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_92%,white)] p-2 lg:min-h-[calc(100dvh-2rem)]">
      <div className="flex w-full flex-col items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel-muted)_74%,white)] shadow-paper">
          <span className="font-display text-sm">AO</span>
        </div>

        <button
          type="button"
          onClick={() => toggleProjectsWidget()}
          className="flex w-full flex-col items-center gap-1 rounded-[1.4rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] px-2 py-3 text-center transition hover:border-[color:var(--accent)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50"
        >
          <FolderKanban className="h-4 w-4 shrink-0 text-[color:var(--accent)] lg:h-3.5 lg:w-3.5" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
            Projects
          </span>
          <Badge className="border-[color:var(--border)] bg-[color:var(--panel)] text-foreground">{projects.length}</Badge>
        </button>

        <div className="mt-1 flex w-full flex-col gap-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = item.view === currentView;
            const href: Route = currentProjectId ? projectViewHref(currentProjectId, item.view) : ("/projects" as Route);

            return (
              <Link
                key={item.view}
                href={href}
                className={cn(
                  "flex w-full flex-col items-center gap-1 rounded-[1.4rem] border px-2 py-3 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50",
                  active
                    ? "border-[color:var(--accent)] bg-[color:color-mix(in_oklab,var(--accent-soft) 42%,white)] shadow-paper"
                    : "border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_94%,white)] text-[color:var(--muted-foreground)] hover:border-[color:var(--accent)] hover:bg-[color:var(--panel)]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0 lg:h-3.5 lg:w-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-3">
        {activeProject ? (
          <Link
            href={projectViewHref(activeProject.id, "presentation")}
            className="flex w-full flex-col items-center gap-1 rounded-[1.4rem] border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_92%,white)] px-2 py-3 text-center transition hover:border-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50"
          >
            <Eye className="h-4 w-4 shrink-0 text-[color:var(--accent)] lg:h-3.5 lg:w-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
              Review
            </span>
            <span className="line-clamp-2 text-[11px] font-medium">{activeProject.title}</span>
          </Link>
        ) : null}
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--panel-muted)] text-xs font-semibold">
          {saving ? "…" : activeProject ? activeProject.title.slice(0, 1) : "?"}
        </div>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute left-[calc(100%+0.85rem)] top-3 z-30 flex h-[calc(100%-1.5rem)] w-[min(360px,calc(100vw-8rem))] origin-left flex-col overflow-hidden rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--panel)] shadow-[0_28px_80px_rgba(64,37,21,0.16)] transition duration-300",
          projectsWidgetOpen ? "translate-x-0 opacity-100" : "-translate-x-6 opacity-0"
        )}
      >
        <div className="pointer-events-auto flex items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--panel)] px-5 py-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
              Project Launcher
            </div>
            <h2 className="mt-1 font-display text-[1.55rem]">Projects</h2>
          </div>
          <button
            type="button"
            onClick={() => toggleProjectsWidget(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_92%,white)] transition hover:border-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50"
            aria-label="Close projects widget"
          >
            <X className="h-4 w-4 shrink-0 lg:h-3.5 lg:w-3.5" />
          </button>
        </div>

        <div className="pointer-events-auto flex flex-1 flex-col gap-4 overflow-y-auto bg-[color:var(--panel)] px-5 py-5">
          <section className="rounded-[1.8rem] border border-[color:var(--border)] bg-mesh p-4">
            <div className="flex items-center gap-3">
              <Plus className="h-4 w-4 shrink-0 text-[color:var(--accent)] lg:h-3.5 lg:w-3.5" />
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                Start from a vague idea
              </div>
            </div>
            <Textarea
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              placeholder="We need a leave approval system for managers and HR..."
              className="mt-4 min-h-[130px]"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {ideaPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setIdea(preset)}
                  className="rounded-full border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_92%,white)] px-3 py-1.5 text-xs font-medium text-[color:var(--muted-foreground)] transition hover:border-[color:var(--accent)] hover:text-foreground"
                >
                  {preset}
                </button>
              ))}
            </div>
            <Button
              className="mt-4 w-full"
              onClick={async () => {
                if (!idea.trim()) {
                  return;
                }
                const project = await createProject(idea);
                setIdea("");
                if (project) {
                  router.push(defaultProjectHref(project.id));
                }
              }}
              disabled={saving}
            >
              <Plus className="h-4 w-4 shrink-0 lg:h-3.5 lg:w-3.5" />
              Create Discovery Project
            </Button>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                Active workspaces
              </div>
              <Badge>{projects.length}</Badge>
            </div>
            {projects.length === 0 ? (
              <div className="rounded-[1.6rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-4 text-sm text-[color:var(--muted-foreground)]">
                Create the first project to start from one idea node, generate AI questions, and unlock artifacts.
              </div>
            ) : (
              projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => {
                    selectProject(project.id);
                    router.push(defaultProjectHref(project.id));
                  }}
                  className={cn(
                    "w-full rounded-[1.65rem] border px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50",
                    project.id === activeProjectId
                      ? "border-[color:var(--accent)] bg-[color:color-mix(in_oklab,var(--accent-soft)_42%,white)] shadow-paper"
                      : "border-[color:var(--border)] bg-[color:var(--panel-muted)] hover:border-[color:var(--accent)] hover:bg-[color:var(--panel)]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-display text-[1.2rem] leading-tight">{project.title}</div>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                        {project.summary}
                      </p>
                    </div>
                    <Badge className="shrink-0">{project.nodes.length} nodes</Badge>
                  </div>
                  <div className="mt-4 text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                    Updated {relativeTime(project.updatedAt)}
                  </div>
                </button>
              ))
            )}
          </section>
        </div>
      </div>
    </aside>
  );
}
