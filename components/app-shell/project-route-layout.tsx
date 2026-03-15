"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspaceStore, type WorkspaceView } from "@/lib/state/workspace-store";
import { ProjectSidebar } from "@/components/app-shell/project-sidebar";
import { TopToolbar } from "@/components/app-shell/top-toolbar";
import { Card } from "@/components/ui/card";
import { defaultProjectHref } from "@/lib/routes";

export function ProjectRouteLayout({
  projectId,
  children
}: {
  projectId: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const loadProjects = useWorkspaceStore((state) => state.loadProjects);
  const selectProject = useWorkspaceStore((state) => state.selectProject);
  const projects = useWorkspaceStore((state) => state.projects);
  const loading = useWorkspaceStore((state) => state.loading);
  const error = useWorkspaceStore((state) => state.error);

  const project = projects.find((item) => item.id === projectId) ?? null;
  const currentView = resolveViewFromPath(pathname);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (project) {
      selectProject(project.id);
    }
  }, [project, selectProject]);

  useEffect(() => {
    if (!loading && projects.length > 0 && !project) {
      router.replace(defaultProjectHref(projects[0].id));
    }
  }, [loading, project, projects, router]);

  return (
    <main className="min-h-screen px-2 py-2 md:px-3 md:py-3 lg:px-4 lg:py-4">
      <div className="mx-auto grid max-w-[1880px] grid-cols-1 items-start gap-3 lg:grid-cols-[80px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-5 lg:self-start">
          <ProjectSidebar currentView={currentView} currentProjectId={projectId} />
        </div>

        <div className="min-w-0 space-y-3 pb-6">
          {project ? (
            <header>
              <TopToolbar project={project} currentView={currentView} />
            </header>
          ) : null}

          {loading && !project ? (
            <Card className="flex min-h-[320px] items-center justify-center">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                Loading project…
              </span>
            </Card>
          ) : null}

          {!loading && !project ? (
            <Card className="min-h-[320px] bg-[color:var(--panel-muted)]">
              <div className="font-display text-[1.8rem]">Project not found</div>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                The requested project is unavailable. Open another one from the projects launcher on the left.
              </p>
            </Card>
          ) : null}

          {project ? <section className="min-w-0 space-y-4">{children}</section> : null}

          {error ? (
            <Card className="border-[color:var(--danger)] bg-[color:color-mix(in_oklab,var(--danger) 8%,white)]">
              <div className="text-sm font-semibold">Error</div>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{error}</p>
            </Card>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function resolveViewFromPath(pathname: string): WorkspaceView {
  if (pathname.endsWith("/overview")) {
    return "overview";
  }
  if (pathname.endsWith("/artifacts")) {
    return "artifacts";
  }
  if (pathname.endsWith("/backlog")) {
    return "backlog";
  }
  if (pathname.endsWith("/review")) {
    return "presentation";
  }
  return "canvas";
}
