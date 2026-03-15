export const projectNodeKinds = [
  "idea",
  "problem",
  "user",
  "stakeholder",
  "goal",
  "feature",
  "requirement",
  "constraint",
  "risk",
  "metric",
  "assumption",
  "open-question"
] as const;

export type ProjectNodeKind = (typeof projectNodeKinds)[number];

export const artifactKinds = ["brd", "prd", "user-stories", "acceptance-criteria"] as const;

export type ArtifactKind = (typeof artifactKinds)[number];

export type AnalystAction =
  | "expand-node"
  | "suggest-children"
  | "identify-gaps"
  | "rewrite-clarity"
  | "suggest-risks"
  | "generate-user-stories"
  | "generate-acceptance-criteria";

export type ProjectModelField =
  | "title"
  | "summary"
  | "problemStatement"
  | "businessObjective"
  | "stakeholders"
  | "targetUsers"
  | "userPainPoints"
  | "scopeIn"
  | "scopeOut"
  | "assumptions"
  | "constraints"
  | "risks"
  | "successMetrics"
  | "functionalRequirements"
  | "nonFunctionalRequirements"
  | "dependencies"
  | "openQuestions";

export interface ProjectModel {
  title: string;
  summary: string;
  problemStatement: string;
  businessObjective: string;
  stakeholders: string[];
  targetUsers: string[];
  userPainPoints: string[];
  scopeIn: string[];
  scopeOut: string[];
  assumptions: string[];
  constraints: string[];
  risks: string[];
  successMetrics: string[];
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  dependencies: string[];
  openQuestions: string[];
}

export interface ValidationWarning {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  field?: ProjectModelField;
}

export interface ProjectNode {
  id: string;
  projectId: string;
  type: ProjectNodeKind;
  title: string;
  description: string;
  details?: string;
  tags: string[];
  sourceField?: ProjectModelField;
  x: number;
  y: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectEdge {
  id: string;
  projectId: string;
  source: string;
  target: string;
  label?: string;
  createdAt: string;
}

export interface ClarificationQuestion {
  id: string;
  prompt: string;
  field: ProjectModelField;
  rationale: string;
  nodeIds: string[];
  priority: "high" | "medium" | "low";
}

export interface ClarificationAnswer {
  questionId: string;
  answer: string;
  field?: ProjectModelField;
  prompt?: string;
  sourceNodeIds?: string[];
  submittedAt: string;
}

export interface ArtifactSection {
  id: string;
  artifactId: string;
  title: string;
  key: string;
  content: string;
  sourceFields: ProjectModelField[];
  sourceNodeIds: string[];
  updatedAt: string;
}

export interface ArtifactDocument {
  id: string;
  projectId: string;
  type: ArtifactKind;
  title: string;
  summary: string;
  status: "draft" | "published";
  sections: ArtifactSection[];
  createdAt: string;
  updatedAt: string;
}

export interface ArtifactVersion {
  id: string;
  artifactId: string;
  versionNumber: number;
  createdAt: string;
}

export interface ProjectRecord {
  id: string;
  workspaceId: string;
  title: string;
  idea: string;
  summary: string;
  model: ProjectModel;
  nodes: ProjectNode[];
  edges: ProjectEdge[];
  artifacts: ArtifactDocument[];
  clarificationQuestions: ClarificationQuestion[];
  clarificationAnswers: ClarificationAnswer[];
  validationWarnings: ValidationWarning[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceSummary {
  id: string;
  title: string;
  description: string;
}

export interface CreateProjectInput {
  idea: string;
  title?: string;
}

export interface CreateNodeInput {
  projectId: string;
  type: ProjectNodeKind;
  title: string;
  description?: string;
  x?: number;
  y?: number;
  sourceField?: ProjectModelField;
}

export interface UpdateNodeInput {
  projectId: string;
  nodeId: string;
  type?: ProjectNodeKind;
  title?: string;
  description?: string;
  details?: string;
  x?: number;
  y?: number;
  tags?: string[];
  sourceField?: ProjectModelField | null;
}

export interface ConnectNodesInput {
  projectId: string;
  source: string;
  target: string;
  label?: string;
}

export interface ExpandNodeResult {
  parentNodeId: string;
  nodes: ProjectNode[];
  edges: ProjectEdge[];
}

export interface GenerateArtifactInput {
  projectId: string;
  type: ArtifactKind;
}

export interface UpdateArtifactSectionInput {
  artifactId: string;
  sectionId: string;
  content: string;
}

export interface RegenerateArtifactSectionInput {
  artifactId: string;
  sectionId: string;
}

export interface IntakeAnalysis {
  title: string;
  summary: string;
  problemStatement: string;
  businessObjective: string;
  stakeholders: string[];
  targetUsers: string[];
}

export interface NodeExpansionOutput {
  parentNodeId: string;
  suggestions: Array<{
    type: ProjectNodeKind;
    title: string;
    description: string;
    relationLabel?: string;
  }>;
}

export interface ArtifactSectionDraft {
  key: string;
  title: string;
  content: string;
  sourceFields: ProjectModelField[];
  sourceNodeIds: string[];
}

export interface ArtifactDraft {
  title: string;
  summary: string;
  sections: ArtifactSectionDraft[];
}

export interface ClarificationPlan {
  questions: ClarificationQuestion[];
}
