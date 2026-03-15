"use client";

import { create } from "zustand";
import {
  type ArtifactDocument,
  type ArtifactKind,
  type ProjectModel,
  type ProjectNodeKind,
  type ProjectRecord
} from "@/lib/domain/contracts";

export type WorkspaceView = "overview" | "canvas" | "artifacts" | "backlog" | "presentation";
export type CanvasPanelTab = "node" | "clarify" | "model";

interface WorkspaceState {
  projects: ProjectRecord[];
  activeProjectId: string | null;
  view: WorkspaceView;
  canvasPanelOpen: boolean;
  canvasPanelTab: CanvasPanelTab;
  projectsWidgetOpen: boolean;
  activeArtifactType: ArtifactKind;
  selectedNodeId: string | null;
  selectedSectionId: string | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  loadProjects: () => Promise<void>;
  createProject: (idea: string) => Promise<ProjectRecord | undefined>;
  refreshProject: (projectId: string) => Promise<void>;
  selectProject: (projectId: string) => void;
  setView: (view: WorkspaceView) => void;
  setCanvasPanelTab: (tab: CanvasPanelTab) => void;
  toggleCanvasPanel: (open?: boolean) => void;
  toggleProjectsWidget: (open?: boolean) => void;
  selectNode: (nodeId: string | null) => void;
  selectArtifactType: (type: ArtifactKind) => void;
  selectSection: (sectionId: string | null) => void;
  updateProjectMeta: (updates: {
    title?: string;
    summary?: string;
    model?: Partial<ProjectModel>;
  }) => Promise<void>;
  createNode: (
    input: {
      type: ProjectNodeKind;
      title: string;
      description?: string;
      x?: number;
      y?: number;
      sourceField?: string;
    },
    options?: { projectId?: string }
  ) => Promise<void>;
  updateNode: (nodeId: string, updates: Record<string, unknown>) => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
  connectNodes: (source: string, target: string, label?: string) => Promise<void>;
  expandNode: (nodeId: string) => Promise<void>;
  syncProjectModel: () => Promise<void>;
  requestClarification: () => Promise<void>;
  submitClarificationAnswer: (questionId: string, answer: string) => Promise<boolean>;
  generateArtifact: (type: ArtifactKind) => Promise<void>;
  updateArtifactSection: (artifactId: string, sectionId: string, content: string) => Promise<void>;
  regenerateArtifactSection: (artifactId: string, sectionId: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  projects: [],
  activeProjectId: null,
  view: "canvas",
  canvasPanelOpen: false,
  canvasPanelTab: "node",
  projectsWidgetOpen: false,
  activeArtifactType: "brd",
  selectedNodeId: null,
  selectedSectionId: null,
  loading: false,
  saving: false,
  error: null,

  setError(error) {
    set({ error });
  },

  async loadProjects() {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/projects", { cache: "no-store" });
      const data = (await response.json()) as { projects: ProjectRecord[]; error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load projects");
      }

      set((state) => ({
        projects: data.projects,
        loading: false,
        activeProjectId:
          state.activeProjectId && data.projects.some((project) => project.id === state.activeProjectId)
            ? state.activeProjectId
            : data.projects[0]?.id ?? null
      }));
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load projects"
      });
    }
  },

  async createProject(idea) {
    set({ saving: true, error: null });
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea })
      });
      const data = (await response.json()) as { project: ProjectRecord; error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create project");
      }

      set((state) => ({
        saving: false,
        view: "canvas",
        canvasPanelOpen: false,
        projectsWidgetOpen: false,
        projects: replaceProject(state.projects, data.project),
        activeProjectId: data.project.id,
        selectedNodeId: data.project.nodes[0]?.id ?? null
      }));
      return data.project;
    } catch (error) {
      set({
        saving: false,
        error: error instanceof Error ? error.message : "Failed to create project"
      });
      return undefined;
    }
  },

  async refreshProject(projectId: string) {
    const response = await fetch(`/api/projects/${projectId}`, { cache: "no-store" });
    const data = (await response.json()) as { project: ProjectRecord; error?: string };
    if (!response.ok) {
      throw new Error(data.error ?? "Failed to refresh project");
    }

    set((state) => ({
      projects: replaceProject(state.projects, data.project)
    }));
  },

  selectProject(projectId) {
    const project = get().projects.find((item) => item.id === projectId);
    set({
      activeProjectId: projectId,
      projectsWidgetOpen: false,
      selectedNodeId: project?.nodes[0]?.id ?? null,
      selectedSectionId: project?.artifacts.find((artifact) => artifact.type === get().activeArtifactType)?.sections[0]?.id ?? null
    });
  },

  setView(view) {
    set({ view });
  },

  setCanvasPanelTab(tab) {
    set({ canvasPanelTab: tab, canvasPanelOpen: true });
  },

  toggleCanvasPanel(open) {
    set((state) => ({
      canvasPanelOpen: typeof open === "boolean" ? open : !state.canvasPanelOpen
    }));
  },

  toggleProjectsWidget(open) {
    set((state) => ({
      projectsWidgetOpen: typeof open === "boolean" ? open : !state.projectsWidgetOpen
    }));
  },

  selectNode(nodeId) {
    set({
      selectedNodeId: nodeId,
      canvasPanelOpen: nodeId ? true : get().canvasPanelOpen,
      canvasPanelTab: nodeId ? "node" : get().canvasPanelTab
    });
  },

  selectArtifactType(type) {
    const project = getActiveProject(get());
    const artifact = project?.artifacts.find((item) => item.type === type);
    set({
      activeArtifactType: type,
      selectedSectionId: artifact?.sections[0]?.id ?? null
    });
  },

  selectSection(sectionId) {
    set({ selectedSectionId: sectionId });
  },

  async updateProjectMeta(updates) {
    const projectId = get().activeProjectId;
    if (!projectId) {
      return;
    }

    await mutateProject(
      set,
      get,
      `/api/projects/${projectId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      },
      "Failed to update project"
    );
  },

  async createNode(input, options) {
    const projectId = options?.projectId ?? get().activeProjectId;
    if (!projectId) {
      set({ error: "No project selected. Open a project from the sidebar." });
      return;
    }

    await mutateProject(
      set,
      get,
      `/api/projects/${projectId}/nodes`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      },
      "Failed to create node"
    );
  },

  async updateNode(nodeId, updates) {
    const projectId = get().activeProjectId;
    if (!projectId) {
      return;
    }

    await mutateProject(
      set,
      get,
      `/api/projects/${projectId}/nodes/${nodeId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      },
      "Failed to update node"
    );
  },

  async deleteNode(nodeId) {
    const projectId = get().activeProjectId;
    if (!projectId) {
      return;
    }

    await mutateProject(
      set,
      get,
      `/api/projects/${projectId}/nodes/${nodeId}`,
      { method: "DELETE" },
      "Failed to delete node"
    );
    set({ selectedNodeId: null });
  },

  async connectNodes(source, target, label) {
    const projectId = get().activeProjectId;
    if (!projectId) {
      return;
    }

    await mutateProject(
      set,
      get,
      `/api/projects/${projectId}/edges`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, target, label })
      },
      "Failed to connect nodes"
    );
  },

  async expandNode(nodeId) {
    const projectId = get().activeProjectId;
    if (!projectId) {
      return;
    }

    set({ saving: true, error: null });
    try {
      const response = await fetch(`/api/projects/${projectId}/nodes/${nodeId}/expand`, {
        method: "POST"
      });
      const data = (await response.json()) as { project: ProjectRecord; error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to expand node");
      }

      set((state) => ({
        saving: false,
        projects: replaceProject(state.projects, data.project)
      }));
    } catch (error) {
      set({
        saving: false,
        error: error instanceof Error ? error.message : "Failed to expand node"
      });
    }
  },

  async syncProjectModel() {
    const projectId = get().activeProjectId;
    if (!projectId) {
      return;
    }

    await mutateProject(
      set,
      get,
      `/api/projects/${projectId}/sync-model`,
      { method: "POST" },
      "Failed to sync project model"
    );
  },

  async requestClarification() {
    const projectId = get().activeProjectId;
    if (!projectId) {
      return;
    }

    await mutateProject(
      set,
      get,
      `/api/projects/${projectId}/sync-model`,
      { method: "POST" },
      "Failed to refresh clarification"
    );
    set({ canvasPanelOpen: true, canvasPanelTab: "clarify" });
  },

  async submitClarificationAnswer(questionId, answer) {
    const projectId = get().activeProjectId;
    if (!projectId || !answer.trim()) {
      return false;
    }

    set({ saving: true, error: null });
    try {
      const previousProject = getActiveProject(get());
      const response = await fetch(`/api/projects/${projectId}/clarification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: [{ questionId, answer }]
        })
      });
      const data = (await response.json()) as { project: ProjectRecord; error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to apply clarification answer");
      }

      const previousNodeIds = new Set(previousProject?.nodes.map((node) => node.id) ?? []);
      const nextClarificationNode =
        [...data.project.nodes]
          .reverse()
          .find((node) => node.tags.includes("clarification-answer") && !previousNodeIds.has(node.id)) ?? null;

      set((state) => ({
        saving: false,
        error: null,
        canvasPanelOpen: true,
        canvasPanelTab: "clarify",
        selectedNodeId: nextClarificationNode?.id ?? state.selectedNodeId,
        projects: replaceProject(state.projects, data.project)
      }));
      return true;
    } catch (error) {
      set({
        saving: false,
        error: error instanceof Error ? error.message : "Failed to apply clarification answer"
      });
      return false;
    }
  },

  async generateArtifact(type) {
    const projectId = get().activeProjectId;
    if (!projectId) {
      return;
    }

    set({ saving: true, error: null });
    try {
      const response = await fetch(`/api/projects/${projectId}/artifacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      });
      const data = (await response.json()) as { artifact: ArtifactDocument; error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to generate artifact");
      }

      set((state) => {
        const project = getActiveProject(state);
        if (!project) {
          return { saving: false };
        }

        const nextProject = {
          ...project,
          artifacts: upsertArtifact(project.artifacts, data.artifact),
          updatedAt: new Date().toISOString()
        };

        return {
          saving: false,
          view: type === "user-stories" || type === "acceptance-criteria" ? ("backlog" as const) : ("artifacts" as const),
          activeArtifactType: type,
          selectedSectionId: data.artifact.sections[0]?.id ?? null,
          projects: replaceProject(state.projects, nextProject)
        };
      });
    } catch (error) {
      set({
        saving: false,
        error: error instanceof Error ? error.message : "Failed to generate artifact"
      });
    }
  },

  async updateArtifactSection(artifactId, sectionId, content) {
    set({ saving: true, error: null });
    try {
      const response = await fetch(`/api/artifacts/${artifactId}/sections/${sectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      const data = (await response.json()) as { artifact: ArtifactDocument; error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to update section");
      }

      set((state) => ({
        saving: false,
        projects: replaceProjectArtifact(state.projects, data.artifact)
      }));
    } catch (error) {
      set({
        saving: false,
        error: error instanceof Error ? error.message : "Failed to update section"
      });
    }
  },

  async regenerateArtifactSection(artifactId, sectionId) {
    set({ saving: true, error: null });
    try {
      const response = await fetch(`/api/artifacts/${artifactId}/sections/${sectionId}/regenerate`, {
        method: "POST"
      });
      const data = (await response.json()) as { artifact: ArtifactDocument; error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to regenerate section");
      }

      set((state) => ({
        saving: false,
        projects: replaceProjectArtifact(state.projects, data.artifact)
      }));
    } catch (error) {
      set({
        saving: false,
        error: error instanceof Error ? error.message : "Failed to regenerate section"
      });
    }
  }
}));

async function mutateProject(
  set: (partial: Partial<WorkspaceState> | ((state: WorkspaceState) => Partial<WorkspaceState>)) => void,
  get: () => WorkspaceState,
  url: string,
  init: RequestInit,
  errorMessage: string
) {
  set({ saving: true, error: null });
  try {
    const response = await fetch(url, init);
    let data: { project?: ProjectRecord; error?: string };
    try {
      data = (await response.json()) as { project?: ProjectRecord; error?: string };
    } catch {
      throw new Error(response.ok ? "Invalid response from server" : errorMessage);
    }
    if (!response.ok) {
      throw new Error(data.error ?? errorMessage);
    }
    const project = data?.project;
    if (!project || typeof project !== "object") {
      throw new Error(data?.error ?? "Server returned invalid project");
    }

    set((state) => ({
      saving: false,
      error: null,
      projects: replaceProject(state.projects, project)
    }));
  } catch (error) {
    set({
      saving: false,
      error: error instanceof Error ? error.message : errorMessage
    });
  }
}

function replaceProject(projects: ProjectRecord[], project: ProjectRecord): ProjectRecord[] {
  const index = projects.findIndex((item) => item.id === project.id);
  if (index === -1) {
    return [project, ...projects];
  }

  const copy = [...projects];
  copy[index] = project;
  return copy;
}

function upsertArtifact(artifacts: ArtifactDocument[], artifact: ArtifactDocument): ArtifactDocument[] {
  const index = artifacts.findIndex((item) => item.id === artifact.id);
  if (index === -1) {
    return [artifact, ...artifacts];
  }

  const copy = [...artifacts];
  copy[index] = artifact;
  return copy;
}

function replaceProjectArtifact(projects: ProjectRecord[], artifact: ArtifactDocument): ProjectRecord[] {
  return projects.map((project) =>
    project.id === artifact.projectId
      ? {
          ...project,
          artifacts: upsertArtifact(project.artifacts, artifact),
          updatedAt: new Date().toISOString()
        }
      : project
  );
}

export function getActiveProject(state: WorkspaceState): ProjectRecord | undefined {
  return state.projects.find((project) => project.id === state.activeProjectId);
}
