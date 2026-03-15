import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  type ArtifactDocument,
  type ClarificationAnswer,
  type ProjectRecord,
  type WorkspaceSummary
} from "@/lib/domain/contracts";
import { DEFAULT_WORKSPACE } from "@/lib/server/defaults";

interface PersistedShape {
  workspaces: WorkspaceSummary[];
  projects: ProjectRecord[];
}

export interface ProjectRepository {
  listProjects(): Promise<ProjectRecord[]>;
  getProject(projectId: string): Promise<ProjectRecord | null>;
  saveProject(project: ProjectRecord): Promise<ProjectRecord>;
  findArtifact(artifactId: string): Promise<{ project: ProjectRecord; artifact: ArtifactDocument } | null>;
  updateArtifact(projectId: string, artifact: ArtifactDocument): Promise<ArtifactDocument>;
  appendClarificationAnswers(projectId: string, answers: ClarificationAnswer[]): Promise<ProjectRecord>;
}

export class FileProjectRepository implements ProjectRepository {
  private readonly dataFile = path.join(process.cwd(), ".data", "projects.json");

  async listProjects(): Promise<ProjectRecord[]> {
    const data = await this.readData();
    return data.projects.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  async getProject(projectId: string): Promise<ProjectRecord | null> {
    const data = await this.readData();
    return data.projects.find((project) => project.id === projectId) ?? null;
  }

  async saveProject(project: ProjectRecord): Promise<ProjectRecord> {
    const data = await this.readData();
    const existingIndex = data.projects.findIndex((item) => item.id === project.id);

    if (existingIndex === -1) {
      data.projects.push(project);
    } else {
      data.projects[existingIndex] = project;
    }

    await this.writeData(data);
    return project;
  }

  async findArtifact(artifactId: string): Promise<{ project: ProjectRecord; artifact: ArtifactDocument } | null> {
    const data = await this.readData();
    for (const project of data.projects) {
      const artifact = project.artifacts.find((item) => item.id === artifactId);
      if (artifact) {
        return { project, artifact };
      }
    }

    return null;
  }

  async updateArtifact(projectId: string, artifact: ArtifactDocument): Promise<ArtifactDocument> {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    project.artifacts = upsertArtifact(project.artifacts, artifact);
    project.updatedAt = new Date().toISOString();
    await this.saveProject(project);
    return artifact;
  }

  async appendClarificationAnswers(projectId: string, answers: ClarificationAnswer[]): Promise<ProjectRecord> {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    project.clarificationAnswers.push(...answers);
    project.updatedAt = new Date().toISOString();
    await this.saveProject(project);
    return project;
  }

  private async readData(): Promise<PersistedShape> {
    await mkdir(path.dirname(this.dataFile), { recursive: true });

    try {
      const raw = await readFile(this.dataFile, "utf8");
      return JSON.parse(raw) as PersistedShape;
    } catch {
      const initial: PersistedShape = {
        workspaces: [DEFAULT_WORKSPACE],
        projects: []
      };
      await this.writeData(initial);
      return initial;
    }
  }

  private async writeData(data: PersistedShape): Promise<void> {
    await writeFile(this.dataFile, JSON.stringify(data, null, 2), "utf8");
  }
}

function upsertArtifact(artifacts: ArtifactDocument[], artifact: ArtifactDocument) {
  const existingIndex = artifacts.findIndex((item) => item.id === artifact.id);
  if (existingIndex === -1) {
    return [...artifacts, artifact];
  }

  const next = [...artifacts];
  next[existingIndex] = artifact;
  return next;
}
