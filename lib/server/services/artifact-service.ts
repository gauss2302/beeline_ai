import {
  type ArtifactDocument,
  type ArtifactSection,
  type ArtifactSectionDraft,
  type ArtifactKind,
  type RegenerateArtifactSectionInput,
  type UpdateArtifactSectionInput
} from "@/lib/domain/contracts";
import { AnalystOrchestrator } from "@/lib/domain/workflows/analyst-orchestrator";
import { type ProjectRepository } from "@/lib/server/repositories/project-repository";

export class ArtifactService {
  constructor(
    private readonly repository: ProjectRepository,
    private readonly orchestrator: AnalystOrchestrator
  ) {}

  async generate(projectId: string, type: ArtifactKind): Promise<ArtifactDocument> {
    const project = await this.repository.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const draft = await this.orchestrator.generateArtifact(project, type);
    const now = new Date().toISOString();
    const artifactId = project.artifacts.find((item) => item.type === type)?.id ?? createId("artifact");
    const artifact: ArtifactDocument = {
      id: artifactId,
      projectId,
      type,
      title: draft.title,
      summary: draft.summary,
      status: "draft",
      sections: draft.sections.map((section, index) => convertSection(artifactSectionId(type, section.key, index), artifactId, section, now)),
      createdAt: project.artifacts.find((item) => item.type === type)?.createdAt ?? now,
      updatedAt: now
    };

    await this.repository.updateArtifact(projectId, artifact);
    return artifact;
  }

  async updateSection(input: UpdateArtifactSectionInput): Promise<ArtifactDocument> {
    const found = await this.repository.findArtifact(input.artifactId);
    if (!found) {
      throw new Error(`Artifact ${input.artifactId} not found`);
    }

    const artifact = {
      ...found.artifact,
      sections: found.artifact.sections.map((section) =>
        section.id === input.sectionId
          ? {
              ...section,
              content: input.content,
              updatedAt: new Date().toISOString()
            }
          : section
      ),
      updatedAt: new Date().toISOString()
    };

    await this.repository.updateArtifact(found.project.id, artifact);
    return artifact;
  }

  async regenerateSection(input: RegenerateArtifactSectionInput): Promise<ArtifactDocument> {
    const found = await this.repository.findArtifact(input.artifactId);
    if (!found) {
      throw new Error(`Artifact ${input.artifactId} not found`);
    }

    const fresh = await this.orchestrator.generateArtifact(found.project, found.artifact.type);
    const nextSections = found.artifact.sections.map((existingSection) => {
      const replacement = fresh.sections.find((item) => item.key === existingSection.key);
      if (!replacement || existingSection.id !== input.sectionId) {
        return existingSection;
      }

      return {
        ...existingSection,
        title: replacement.title,
        content: replacement.content,
        sourceFields: replacement.sourceFields,
        sourceNodeIds: replacement.sourceNodeIds,
        updatedAt: new Date().toISOString()
      };
    });

    const artifact = {
      ...found.artifact,
      sections: nextSections,
      updatedAt: new Date().toISOString()
    };

    await this.repository.updateArtifact(found.project.id, artifact);
    return artifact;
  }
}

function convertSection(
  id: string,
  artifactId: string,
  section: ArtifactSectionDraft,
  now: string
): ArtifactSection {
  return {
    id,
    artifactId,
    title: section.title,
    key: section.key,
    content: section.content,
    sourceFields: section.sourceFields,
    sourceNodeIds: section.sourceNodeIds,
    updatedAt: now
  };
}

function artifactSectionId(type: ArtifactKind, key: string, index: number): string {
  return `section_${type}_${key}_${index + 1}`;
}

function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
