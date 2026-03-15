import { asc, desc, eq, inArray } from "drizzle-orm";
import {
  artifacts,
  artifactSections,
  clarificationAnswers,
  clarificationRounds,
  projectEdges,
  projectNodes,
  projects,
  users,
  workspaces
} from "@/lib/db/schema";
import { getDb } from "@/lib/db/client";
import {
  type ArtifactSection as ArtifactSectionModel,
  type ArtifactDocument,
  type ClarificationAnswer,
  type ClarificationQuestion,
  type ProjectModel,
  type ProjectModelField,
  type ProjectRecord,
  type ValidationWarning
} from "@/lib/domain/contracts";
import { DEFAULT_OWNER_ID, DEFAULT_WORKSPACE, DEFAULT_WORKSPACE_ID } from "@/lib/server/defaults";
import { type ProjectRepository } from "@/lib/server/repositories/project-repository";

interface AnalysisState {
  clarificationQuestions?: ClarificationQuestion[];
  validationWarnings?: ValidationWarning[];
}

export class PostgresProjectRepository implements ProjectRepository {
  private bootstrapped: Promise<void> | null = null;

  async listProjects(): Promise<ProjectRecord[]> {
    await this.ensureDefaults();
    const db = this.requireDb();
    const projectRows = await db.select().from(projects).orderBy(desc(projects.updatedAt));
    return this.hydrateProjects(projectRows);
  }

  async getProject(projectId: string): Promise<ProjectRecord | null> {
    await this.ensureDefaults();
    const db = this.requireDb();
    const projectRows = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    const [project] = await this.hydrateProjects(projectRows);
    return project ?? null;
  }

  async saveProject(project: ProjectRecord): Promise<ProjectRecord> {
    await this.ensureDefaults();
    const db = this.requireDb();

    await db.transaction(async (tx) => {
      await tx
        .insert(projects)
        .values({
          id: project.id,
          workspaceId: project.workspaceId || DEFAULT_WORKSPACE_ID,
          title: project.title,
          idea: project.idea,
          summary: project.summary,
          canonicalModel: project.model as unknown as Record<string, unknown>,
          analysisState: {
            clarificationQuestions: project.clarificationQuestions,
            validationWarnings: project.validationWarnings
          },
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt)
        })
        .onConflictDoUpdate({
          target: projects.id,
          set: {
            workspaceId: project.workspaceId || DEFAULT_WORKSPACE_ID,
            title: project.title,
            idea: project.idea,
            summary: project.summary,
            canonicalModel: project.model as unknown as Record<string, unknown>,
            analysisState: {
              clarificationQuestions: project.clarificationQuestions,
              validationWarnings: project.validationWarnings
            },
            updatedAt: new Date(project.updatedAt)
          }
        });

      const existingArtifactIds = await tx
        .select({ id: artifacts.id })
        .from(artifacts)
        .where(eq(artifacts.projectId, project.id));

      if (existingArtifactIds.length > 0) {
        await tx.delete(artifactSections).where(inArray(artifactSections.artifactId, existingArtifactIds.map((row) => row.id)));
      }

      await tx.delete(artifacts).where(eq(artifacts.projectId, project.id));
      await tx.delete(projectEdges).where(eq(projectEdges.projectId, project.id));
      await tx.delete(projectNodes).where(eq(projectNodes.projectId, project.id));
      await tx.delete(clarificationRounds).where(eq(clarificationRounds.projectId, project.id));

      if (project.nodes.length > 0) {
        await tx.insert(projectNodes).values(
          project.nodes.map((node) => ({
            id: node.id,
            projectId: node.projectId,
            type: node.type,
            title: node.title,
            description: node.description,
            details: node.details ?? null,
            tags: node.tags,
            sourceField: node.sourceField ?? null,
            positionX: node.x,
            positionY: node.y,
            createdAt: new Date(node.createdAt),
            updatedAt: new Date(node.updatedAt)
          }))
        );
      }

      if (project.edges.length > 0) {
        await tx.insert(projectEdges).values(
          project.edges.map((edge) => ({
            id: edge.id,
            projectId: edge.projectId,
            sourceNodeId: edge.source,
            targetNodeId: edge.target,
            label: edge.label ?? null,
            createdAt: new Date(edge.createdAt)
          }))
        );
      }

      if (project.artifacts.length > 0) {
        await tx.insert(artifacts).values(
          project.artifacts.map((artifact) => ({
            id: artifact.id,
            projectId: artifact.projectId,
            type: artifact.type,
            title: artifact.title,
            summary: artifact.summary,
            status: artifact.status,
            createdAt: new Date(artifact.createdAt),
            updatedAt: new Date(artifact.updatedAt)
          }))
        );

        const sections = project.artifacts.flatMap((artifact) =>
          artifact.sections.map((section, index) => ({
            id: section.id,
            artifactId: artifact.id,
            sectionKey: section.key,
            title: section.title,
            sortOrder: index,
            content: section.content,
            sourceFields: section.sourceFields,
            sourceNodeIds: section.sourceNodeIds,
            createdAt: new Date(artifact.createdAt),
            updatedAt: new Date(section.updatedAt)
          }))
        );

        if (sections.length > 0) {
          await tx.insert(artifactSections).values(sections);
        }
      }

      if (project.clarificationAnswers.length > 0) {
        const roundId = `clarification_${project.id}`;
        await tx.insert(clarificationRounds).values({
          id: roundId,
          projectId: project.id,
          status: "succeeded",
          createdAt: new Date(project.updatedAt),
          completedAt: new Date(project.updatedAt)
        });

        await tx.insert(clarificationAnswers).values(
          project.clarificationAnswers.map((answer, index) => ({
            id: `clarification_answer_${project.id}_${index + 1}`,
            roundId,
            questionId: answer.questionId,
            field:
              answer.field ??
              project.clarificationQuestions.find((question) => question.id === answer.questionId)?.field ??
              "openQuestions",
            prompt:
              answer.prompt ??
              project.clarificationQuestions.find((question) => question.id === answer.questionId)?.prompt ??
              answer.questionId,
            answer: answer.answer,
            sourceNodeIds:
              answer.sourceNodeIds ??
              project.clarificationQuestions.find((question) => question.id === answer.questionId)?.nodeIds ??
              [],
            createdAt: new Date(answer.submittedAt)
          }))
        );
      }
    });

    const saved = await this.getProject(project.id);
    if (!saved) {
      throw new Error("Failed to load project after save");
    }
    return saved;
  }

  async findArtifact(artifactId: string): Promise<{ project: ProjectRecord; artifact: ArtifactDocument } | null> {
    await this.ensureDefaults();
    const db = this.requireDb();
    const artifactRows = await db.select().from(artifacts).where(eq(artifacts.id, artifactId)).limit(1);
    const artifactRow = artifactRows[0];
    if (!artifactRow) {
      return null;
    }

    const project = await this.getProject(artifactRow.projectId);
    if (!project) {
      return null;
    }

    const artifact = project.artifacts.find((item) => item.id === artifactId);
    return artifact ? { project, artifact } : null;
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
    return this.saveProject(project);
  }

  private requireDb() {
    const db = getDb();
    if (!db) {
      throw new Error("DATABASE_URL is not configured");
    }
    return db;
  }

  private async ensureDefaults() {
    if (!this.bootstrapped) {
      this.bootstrapped = this.bootstrap();
    }

    await this.bootstrapped;
  }

  private async bootstrap() {
    const db = this.requireDb();
    await db
      .insert(users)
      .values({
        id: DEFAULT_OWNER_ID,
        email: "system@analyst-os.local",
        fullName: "Analyst OS"
      })
      .onConflictDoNothing();

    await db
      .insert(workspaces)
      .values({
        id: DEFAULT_WORKSPACE_ID,
        ownerId: DEFAULT_OWNER_ID,
        title: DEFAULT_WORKSPACE.title,
        description: DEFAULT_WORKSPACE.description
      })
      .onConflictDoNothing();
  }

  private async hydrateProjects(projectRows: Array<typeof projects.$inferSelect>): Promise<ProjectRecord[]> {
    if (projectRows.length === 0) {
      return [];
    }

    const db = this.requireDb();
    const projectIds = projectRows.map((row) => row.id);
    const nodeRows = await db
      .select()
      .from(projectNodes)
      .where(inArray(projectNodes.projectId, projectIds))
      .orderBy(asc(projectNodes.createdAt));
    const edgeRows = await db
      .select()
      .from(projectEdges)
      .where(inArray(projectEdges.projectId, projectIds))
      .orderBy(asc(projectEdges.createdAt));
    const artifactRows = await db
      .select()
      .from(artifacts)
      .where(inArray(artifacts.projectId, projectIds))
      .orderBy(asc(artifacts.createdAt));

    const artifactIds = artifactRows.map((row) => row.id);
    const sectionRows =
      artifactIds.length > 0
        ? await db
            .select()
            .from(artifactSections)
            .where(inArray(artifactSections.artifactId, artifactIds))
            .orderBy(asc(artifactSections.sortOrder))
        : [];

    const roundRows = await db
      .select()
      .from(clarificationRounds)
      .where(inArray(clarificationRounds.projectId, projectIds))
      .orderBy(desc(clarificationRounds.createdAt));
    const roundIds = roundRows.map((row) => row.id);
    const answerRows =
      roundIds.length > 0
        ? await db
            .select()
            .from(clarificationAnswers)
            .where(inArray(clarificationAnswers.roundId, roundIds))
            .orderBy(asc(clarificationAnswers.createdAt))
        : [];

    const roundProjectById = new Map(roundRows.map((row) => [row.id, row.projectId]));

    return projectRows.map((projectRow) => {
      const analysisState = (projectRow.analysisState ?? {}) as AnalysisState;
      const projectArtifacts = artifactRows
        .filter((artifact) => artifact.projectId === projectRow.id)
        .map((artifact) => ({
          id: artifact.id,
          projectId: artifact.projectId,
          type: artifact.type,
          title: artifact.title,
          summary: artifact.summary,
          status: artifact.status,
          sections: sectionRows
            .filter((section) => section.artifactId === artifact.id)
            .map((section) => ({
              id: section.id,
              artifactId: section.artifactId,
              key: section.sectionKey,
              title: section.title,
              content: section.content,
              sourceFields: section.sourceFields as ArtifactSectionModel["sourceFields"],
              sourceNodeIds: section.sourceNodeIds,
              updatedAt: section.updatedAt.toISOString()
            })) as ArtifactSectionModel[],
          createdAt: artifact.createdAt.toISOString(),
          updatedAt: artifact.updatedAt.toISOString()
        }));

      return {
        id: projectRow.id,
        workspaceId: projectRow.workspaceId,
        title: projectRow.title,
        idea: projectRow.idea,
        summary: projectRow.summary,
        model: projectRow.canonicalModel as unknown as ProjectModel,
        nodes: nodeRows
          .filter((row) => row.projectId === projectRow.id)
          .map((row) => ({
            id: row.id,
            projectId: row.projectId,
            type: row.type,
            title: row.title,
            description: row.description,
            details: row.details ?? "",
            tags: row.tags,
            sourceField: row.sourceField as never,
            x: row.positionX,
            y: row.positionY,
            createdAt: row.createdAt.toISOString(),
            updatedAt: row.updatedAt.toISOString()
          })),
        edges: edgeRows
          .filter((row) => row.projectId === projectRow.id)
          .map((row) => ({
            id: row.id,
            projectId: row.projectId,
            source: row.sourceNodeId,
            target: row.targetNodeId,
            label: row.label ?? undefined,
            createdAt: row.createdAt.toISOString()
          })),
        artifacts: projectArtifacts,
        clarificationQuestions: analysisState.clarificationQuestions ?? [],
        clarificationAnswers: answerRows
          .filter((row) => roundProjectById.get(row.roundId) === projectRow.id)
          .map((row) => ({
            questionId: row.questionId,
            field: row.field as ProjectModelField,
            prompt: row.prompt,
            answer: row.answer,
            sourceNodeIds: row.sourceNodeIds,
            submittedAt: row.createdAt.toISOString()
          })),
        validationWarnings: analysisState.validationWarnings ?? [],
        createdAt: projectRow.createdAt.toISOString(),
        updatedAt: projectRow.updatedAt.toISOString()
      };
    });
  }
}

function upsertArtifact(artifactsList: ArtifactDocument[], artifact: ArtifactDocument) {
  const existingIndex = artifactsList.findIndex((item) => item.id === artifact.id);
  if (existingIndex === -1) {
    return [...artifactsList, artifact];
  }

  const next = [...artifactsList];
  next[existingIndex] = artifact;
  return next;
}
