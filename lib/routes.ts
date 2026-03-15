import type { Route } from "next";
import { type WorkspaceView } from "@/lib/state/workspace-store";

export function projectViewHref(projectId: string, view: WorkspaceView): Route {
  switch (view) {
    case "overview":
      return `/projects/${projectId}/overview` as Route;
    case "canvas":
      return `/projects/${projectId}/canvas` as Route;
    case "artifacts":
      return `/projects/${projectId}/artifacts` as Route;
    case "backlog":
      return `/projects/${projectId}/backlog` as Route;
    case "presentation":
      return `/projects/${projectId}/review` as Route;
  }
}

export function defaultProjectHref(projectId: string): Route {
  return projectViewHref(projectId, "canvas");
}
