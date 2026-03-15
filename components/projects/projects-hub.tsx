"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, Plus } from "lucide-react";
import { useWorkspaceStore } from "@/lib/state/workspace-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { relativeTime } from "@/lib/utils";
import { defaultProjectHref } from "@/lib/routes";

const ideaPresets = [
  "We need a leave approval system for managers, HR, and employees",
  "We want an internal finance dashboard with approvals, variance analysis, and audit trails",
  "We need a platform for hackathon participants, judges, and organizers",
  "We need a vendor onboarding workflow with compliance checks and decision tracking"
];

export function ProjectsHub() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const loadProjects = useWorkspaceStore((state) => state.loadProjects);
  const projects = useWorkspaceStore((state) => state.projects);
  const saving = useWorkspaceStore((state) => state.saving);
  const loading = useWorkspaceStore((state) => state.loading);
  const createProject = useWorkspaceStore((state) => state.createProject);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* Compact hero */}
        <header className="text-center">
          <Badge>Projects</Badge>
          <h1 className="mt-2 font-display text-xl leading-tight md:text-2xl text-[color:var(--foreground)]">
            Idea to structured product thinking
          </h1>
          <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
            Launcher for board, documents, backlog, and review.
          </p>
        </header>

        {/* Start with a vague idea — centered below hero */}
        <section className="mx-auto flex max-w-xl flex-col items-center">
          <Card className="w-full border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_92%,white)] px-4 py-4 md:px-5 md:py-5">
            <div className="flex items-center justify-center gap-2">
              <FolderKanban className="h-4 w-4 text-[color:var(--accent)]" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                Start with a vague idea
              </span>
            </div>
            <Textarea
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              placeholder="We need a leave approval system for managers and HR..."
              className="mt-3 min-h-[120px]"
            />
            <div className="mt-3 flex flex-wrap justify-center gap-2">
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
              <Plus className="h-4 w-4" />
              Create Discovery Project
            </Button>
          </Card>
        </section>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
              Existing projects
            </div>
            <Badge>{projects.length}</Badge>
          </div>

          {loading ? (
            <Card className="min-h-[240px] bg-[color:var(--panel-muted)]">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                Loading projects…
              </span>
            </Card>
          ) : null}

          {!loading && projects.length === 0 ? (
            <Card className="bg-[color:var(--panel-muted)]">
              <p className="text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                No projects yet. Start from the launcher above.
              </p>
            </Card>
          ) : null}

          {!loading && projects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => router.push(defaultProjectHref(project.id))}
                  className="rounded-[1.8rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] px-5 py-5 text-left transition hover:border-[color:var(--accent)] hover:bg-[color:var(--panel)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-display text-[1.35rem] leading-tight">{project.title}</div>
                      <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                        {project.summary}
                      </p>
                    </div>
                    <Badge>{project.nodes.length} nodes</Badge>
                  </div>
                  <div className="mt-5 text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                    Updated {relativeTime(project.updatedAt)}
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
