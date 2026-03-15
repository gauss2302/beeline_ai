"use client";

import { ArtifactEditor } from "@/components/artifacts/artifact-editor";
import { CanvasBoardScreen } from "@/components/screens/canvas-board-screen";
import { OverviewScreen } from "@/components/screens/overview-screen";
import { BacklogScreen } from "@/components/screens/backlog-screen";
import { PresentationScreen } from "@/components/screens/presentation-screen";
import { useWorkspaceStore, type WorkspaceView } from "@/lib/state/workspace-store";

export function ProjectPageContent({
  projectId,
  view
}: {
  projectId: string;
  view: WorkspaceView;
}) {
  const project = useWorkspaceStore((state) => state.projects.find((item) => item.id === projectId) ?? null);

  if (!project) {
    return null;
  }

  if (view === "overview") {
    return <OverviewScreen project={project} />;
  }

  if (view === "canvas") {
    return <CanvasBoardScreen project={project} />;
  }

  if (view === "artifacts") {
    return <ArtifactEditor project={project} />;
  }

  if (view === "backlog") {
    return <BacklogScreen project={project} />;
  }

  return <PresentationScreen project={project} />;
}
