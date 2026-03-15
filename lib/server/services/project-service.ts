import {
  type ClarificationAnswer,
  type ClarificationQuestion,
  type ClarificationPlan,
  type ConnectNodesInput,
  type CreateNodeInput,
  type CreateProjectInput,
  type ExpandNodeResult,
  type ProjectModelField,
  type ProjectNode,
  type ProjectRecord,
  type UpdateNodeInput
} from "@/lib/domain/contracts";
import { buildSeedModel, deriveProjectModelFromNodes, validateProjectModel } from "@/lib/domain/project-model";
import { AnalystOrchestrator } from "@/lib/domain/workflows/analyst-orchestrator";
import { DEFAULT_WORKSPACE_ID } from "@/lib/server/defaults";
import { type ProjectRepository } from "@/lib/server/repositories/project-repository";

export class ProjectService {
  constructor(
    private readonly repository: ProjectRepository,
    private readonly orchestrator: AnalystOrchestrator
  ) {}

  async listProjects(): Promise<ProjectRecord[]> {
    return this.repository.listProjects();
  }

  async getProject(projectId: string): Promise<ProjectRecord | null> {
    return this.repository.getProject(projectId);
  }

  async createProject(input: CreateProjectInput): Promise<ProjectRecord> {
    const intake = await this.orchestrator.analyzeIntake(input);
    const now = new Date().toISOString();
    const projectId = createId("project");
    const ideaNodeId = createId("node");
    const rootNode: ProjectNode = {
      id: ideaNodeId,
      projectId,
      type: "idea",
      title: intake.title,
      description: intake.summary,
      details: input.idea.trim(),
      tags: ["root"],
      sourceField: "summary",
      x: 0,
      y: 0,
      createdAt: now,
      updatedAt: now
    };

    const project: ProjectRecord = {
      id: projectId,
      workspaceId: DEFAULT_WORKSPACE_ID,
      title: intake.title,
      idea: input.idea,
      summary: intake.summary,
      model: buildSeedModel(input, intake),
      nodes: [rootNode],
      edges: [],
      artifacts: [],
      clarificationQuestions: [],
      clarificationAnswers: [],
      validationWarnings: [],
      createdAt: now,
      updatedAt: now
    };

    return this.syncAndSave(project);
  }

  async updateProject(
    projectId: string,
    updates: {
      title?: string;
      summary?: string;
      model?: Partial<ProjectRecord["model"]>;
    }
  ): Promise<ProjectRecord> {
    const project = await this.requireProject(projectId);
    if (updates.title !== undefined) {
      project.title = updates.title;
      project.model.title = updates.title;
    }

    if (updates.summary !== undefined) {
      project.summary = updates.summary;
      project.model.summary = updates.summary;
    }

    if (updates.model) {
      project.model = {
        ...project.model,
        ...updates.model
      };
    }

    return this.syncAndSave(project);
  }

  async createNode(input: CreateNodeInput): Promise<ProjectRecord> {
    const project = await this.requireProject(input.projectId);
    const now = new Date().toISOString();
    project.nodes.push({
      id: createId("node"),
      projectId: input.projectId,
      type: input.type,
      title: input.title,
      description: input.description ?? "",
      details: "",
      tags: ["manual"],
      sourceField: input.sourceField,
      x: input.x ?? 120,
      y: input.y ?? 120,
      createdAt: now,
      updatedAt: now
    });
    return this.syncAndSave(project);
  }

  async updateNode(input: UpdateNodeInput): Promise<ProjectRecord> {
    const project = await this.requireProject(input.projectId);
    project.nodes = project.nodes.map((node) =>
      node.id === input.nodeId
        ? {
            ...node,
            type: input.type ?? node.type,
            title: input.title ?? node.title,
            description: input.description ?? node.description,
            details: input.details ?? node.details,
            x: input.x ?? node.x,
            y: input.y ?? node.y,
            tags: input.tags ?? node.tags,
            sourceField: input.sourceField === null ? undefined : input.sourceField ?? node.sourceField,
            updatedAt: new Date().toISOString()
          }
        : node
    );
    return this.syncAndSave(project);
  }

  async deleteNode(projectId: string, nodeId: string): Promise<ProjectRecord> {
    const project = await this.requireProject(projectId);
    project.nodes = project.nodes.filter((node) => node.id !== nodeId);
    project.edges = project.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);
    return this.syncAndSave(project);
  }

  async connectNodes(input: ConnectNodesInput): Promise<ProjectRecord> {
    const project = await this.requireProject(input.projectId);
    const exists = project.edges.find(
      (edge) => edge.source === input.source && edge.target === input.target
    );
    if (!exists) {
      project.edges.push({
        id: createId("edge"),
        projectId: input.projectId,
        source: input.source,
        target: input.target,
        label: input.label,
        createdAt: new Date().toISOString()
      });
    }
    return this.syncAndSave(project);
  }

  async expandNode(projectId: string, nodeId: string): Promise<{ project: ProjectRecord; expansion: ExpandNodeResult }> {
    const project = await this.requireProject(projectId);
    const expansion = await this.orchestrator.expandNode(project, nodeId);
    const now = new Date().toISOString();
    const parentNode = project.nodes.find((node) => node.id === nodeId);
    const createdNodes = expansion.suggestions.map((suggestion, index) => ({
      id: createId("node"),
      projectId,
      type: suggestion.type,
      title: suggestion.title,
      description: suggestion.description,
      details: "",
      tags: ["ai-expanded"],
      sourceField: undefined,
      x: (parentNode?.x ?? 0) + 280,
      y: (parentNode?.y ?? 0) + index * 130 - 100,
      createdAt: now,
      updatedAt: now
    }));

    project.nodes.push(...createdNodes);
    const createdEdges = createdNodes.map((node, index) => ({
      id: createId("edge"),
      projectId,
      source: nodeId,
      target: node.id,
      label: expansion.suggestions[index]?.relationLabel ?? "expands",
      createdAt: now
    }));
    project.edges.push(...createdEdges);

    const saved = await this.syncAndSave(project);
    return {
      project: saved,
      expansion: {
        parentNodeId: nodeId,
        nodes: createdNodes,
        edges: createdEdges
      }
    };
  }

  async syncProjectModel(projectId: string): Promise<ProjectRecord> {
    const project = await this.requireProject(projectId);
    return this.syncAndSave(project);
  }

  async planClarification(projectId: string): Promise<ClarificationPlan> {
    const project = await this.requireProject(projectId);
    const synced = await this.syncAndSave(project);
    return {
      questions: synced.clarificationQuestions
    };
  }

  async submitClarificationAnswers(
    projectId: string,
    answers: Array<{ questionId: string; answer: string }>
  ): Promise<ProjectRecord> {
    const project = await this.requireProject(projectId);
    const byQuestionId = new Map(project.clarificationQuestions.map((question) => [question.id, question]));
    const stamped: ClarificationAnswer[] = [];

    for (const entry of answers) {
      const answer = entry.answer.trim();
      if (!answer) {
        continue;
      }

      const question = byQuestionId.get(entry.questionId);
      const submittedAt = new Date().toISOString();
      stamped.push({
        questionId: entry.questionId,
        answer,
        field: question?.field,
        prompt: question?.prompt,
        sourceNodeIds: question?.nodeIds ?? [],
        submittedAt
      });

      if (!question) {
        continue;
      }

      if (shouldApplyAnswerDirectly(question.field)) {
        this.applyAnswer(project, question.field, answer);
      }

      const clarificationNote = buildClarificationNote({
        project,
        projectId,
        question,
        answer,
        submittedAt
      });
      project.nodes.push(clarificationNote.node);
      project.edges.push(...clarificationNote.edges);
    }

    if (stamped.length === 0) {
      return project;
    }

    project.clarificationAnswers.push(...stamped);
    return this.syncAndSave(project);
  }

  private applyAnswer(project: ProjectRecord, field: ProjectModelField, answer: string) {
    const current = project.model[field];
    if (Array.isArray(current)) {
      if (!current.includes(answer)) {
        current.push(answer);
      }
      return;
    }

    project.model[field] = answer as never;
  }

  private async syncAndSave(project: ProjectRecord): Promise<ProjectRecord> {
    project.model = deriveProjectModelFromNodes(project);
    project.summary = project.model.summary;
    project.title = project.model.title || project.title;
    project.validationWarnings = validateProjectModel(project.model);
    try {
      project.clarificationQuestions = (await this.orchestrator.planClarification(project)).questions;
    } catch (e) {
      console.warn("planClarification failed, saving with no questions", e);
      project.clarificationQuestions = [];
    }
    project.updatedAt = new Date().toISOString();
    return this.repository.saveProject(project);
  }

  private async requireProject(projectId: string): Promise<ProjectRecord> {
    const project = await this.repository.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }
    return project;
  }
}

function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function shouldApplyAnswerDirectly(field: ProjectModelField) {
  return field === "title" || field === "businessObjective";
}

function buildClarificationNote({
  project,
  projectId,
  question,
  answer,
  submittedAt
}: {
  project: ProjectRecord;
  projectId: string;
  question: ClarificationQuestion;
  answer: string;
  submittedAt: string;
}) {
  const noteId = createId("node");
  const existingClarificationCount = project.nodes.filter((node) => node.tags.includes("clarification-answer")).length;
  const nodeIndex = new Map(project.nodes.map((node) => [node.id, node]));
  const relatedNodes = question.nodeIds.map((nodeId) => nodeIndex.get(nodeId)).filter(Boolean) as ProjectNode[];
  const anchor = relatedNodes[0] ?? project.nodes.find((node) => node.type === "idea") ?? project.nodes[0];
  const offsetY = ((existingClarificationCount % 4) - 1.5) * 92;

  const node: ProjectNode = {
    id: noteId,
    projectId,
    type: clarificationNodeTypeByField[question.field] ?? "requirement",
    title: buildClarificationTitle(question.field, answer),
    description: answer,
    details: `Question: ${question.prompt}\n\nAnswer: ${answer}`,
    tags: ["clarification-answer", "comment"],
    sourceField: question.field,
    x: (anchor?.x ?? 240) + 280,
    y: Math.round((anchor?.y ?? 0) + offsetY),
    createdAt: submittedAt,
    updatedAt: submittedAt
  };

  const relationSources =
    relatedNodes.length > 0
      ? relatedNodes.slice(0, 3).map((item) => item.id)
      : anchor
        ? [anchor.id]
        : [];

  const edges = relationSources.map((sourceNodeId) => ({
    id: createId("edge"),
    projectId,
    source: sourceNodeId,
    target: noteId,
    label: "clarifies",
    createdAt: submittedAt
  }));

  return { node, edges };
}

function buildClarificationTitle(field: ProjectModelField, answer: string) {
  const normalized = answer.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return `Clarified ${clarificationFieldLabels[field] ?? "detail"}`;
  }

  const headline = normalized.split(/(?<=[.!?])\s+/u)[0]?.trim() ?? normalized;
  const title = headline.length > 88 ? `${headline.slice(0, 85).trimEnd()}...` : headline;
  return title || `Clarified ${clarificationFieldLabels[field] ?? "detail"}`;
}

const clarificationFieldLabels: Record<ProjectModelField, string> = {
  title: "title",
  summary: "summary",
  problemStatement: "problem statement",
  businessObjective: "business objective",
  stakeholders: "stakeholders",
  targetUsers: "target users",
  userPainPoints: "user pain points",
  scopeIn: "scope inclusion",
  scopeOut: "scope exclusion",
  assumptions: "assumptions",
  constraints: "constraints",
  risks: "risks",
  successMetrics: "success metrics",
  functionalRequirements: "functional requirement",
  nonFunctionalRequirements: "non-functional requirement",
  dependencies: "dependencies",
  openQuestions: "open questions"
};

const clarificationNodeTypeByField: Record<ProjectModelField, ProjectNode["type"]> = {
  title: "idea",
  summary: "idea",
  problemStatement: "problem",
  businessObjective: "goal",
  stakeholders: "stakeholder",
  targetUsers: "user",
  userPainPoints: "user",
  scopeIn: "feature",
  scopeOut: "constraint",
  assumptions: "assumption",
  constraints: "constraint",
  risks: "risk",
  successMetrics: "metric",
  functionalRequirements: "requirement",
  nonFunctionalRequirements: "constraint",
  dependencies: "constraint",
  openQuestions: "open-question"
};
