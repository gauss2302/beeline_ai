import { type ArtifactKind, type ProjectRecord } from "@/lib/domain/contracts";

export interface ReadinessPillar {
  id: string;
  label: string;
  value: number;
  max: number;
  tone: "healthy" | "watch" | "critical";
}

export interface NextBestAction {
  id: string;
  label: string;
  description: string;
  action:
    | "clarify"
    | "sync"
    | "generate-brd"
    | "generate-prd"
    | "generate-stories"
    | "expand-selected";
}

export interface ProjectAnalytics {
  readinessScore: number;
  readinessLabel: string;
  nodeCount: number;
  featureCount: number;
  riskCount: number;
  questionCount: number;
  artifactCoverage: number;
  pillars: ReadinessPillar[];
  focusAreas: string[];
  nextActions: NextBestAction[];
}

export function deriveProjectAnalytics(project: ProjectRecord): ProjectAnalytics {
  const pillars: ReadinessPillar[] = [
    pillar("problem", "Problem", project.model.problemStatement ? 1 : 0, 1),
    pillar("users", "Users", Math.min(project.model.targetUsers.length, 3), 3),
    pillar("scope", "Scope", Math.min(project.model.functionalRequirements.length + project.model.scopeIn.length, 6), 6),
    pillar("risks", "Risks", Math.min(project.model.risks.length + project.model.constraints.length, 4), 4),
    pillar("metrics", "Metrics", Math.min(project.model.successMetrics.length, 3), 3),
    pillar("docs", "Docs", Math.min(project.artifacts.length, 2), 2)
  ];

  const achieved = pillars.reduce((sum, item) => sum + item.value, 0);
  const total = pillars.reduce((sum, item) => sum + item.max, 0);
  const readinessScore = Math.round((achieved / total) * 100);
  const artifactTypes: ArtifactKind[] = ["brd", "prd", "user-stories", "acceptance-criteria"];
  const coverage = Math.round(
    (project.artifacts.filter((artifact) => artifactTypes.includes(artifact.type)).length / artifactTypes.length) * 100
  );

  const focusAreas = [
    project.model.targetUsers.length === 0 ? "Define target user roles" : null,
    project.model.successMetrics.length === 0 ? "Add measurable business KPIs" : null,
    project.model.functionalRequirements.length < 3 ? "Break scope into concrete requirements" : null,
    project.model.risks.length === 0 ? "Map operational and compliance risks" : null,
    project.model.openQuestions.length > 0 ? "Resolve open discovery questions" : null
  ].filter(Boolean) as string[];

  const nextActions: NextBestAction[] = [];
  if (project.clarificationQuestions.length > 0) {
    nextActions.push({
      id: "clarify",
      label: "Run clarification",
      description: `${project.clarificationQuestions.length} high-impact unknowns are blocking stronger requirements.`,
      action: "clarify"
    });
  }
  if (project.model.functionalRequirements.length < 3) {
    nextActions.push({
      id: "expand",
      label: "Expand the active branch",
      description: "Push the current idea into more specific features and rules.",
      action: "expand-selected"
    });
  }
  if (!project.artifacts.find((artifact) => artifact.type === "brd")) {
    nextActions.push({
      id: "brd",
      label: "Generate BRD",
      description: "Convert the business context and scope into a stakeholder-ready document.",
      action: "generate-brd"
    });
  }
  if (!project.artifacts.find((artifact) => artifact.type === "prd")) {
    nextActions.push({
      id: "prd",
      label: "Generate PRD",
      description: "Translate the graph and model into product-facing functional detail.",
      action: "generate-prd"
    });
  }
  if (!project.artifacts.find((artifact) => artifact.type === "user-stories")) {
    nextActions.push({
      id: "stories",
      label: "Generate user stories",
      description: "Turn refined features into backlog-ready story format.",
      action: "generate-stories"
    });
  }
  nextActions.push({
    id: "sync",
    label: "Sync source of truth",
    description: "Reconcile graph edits back into the canonical project model.",
    action: "sync"
  });

  return {
    readinessScore,
    readinessLabel:
      readinessScore >= 80 ? "Decision-ready" : readinessScore >= 55 ? "Clarify before committing" : "Early discovery",
    nodeCount: project.nodes.length,
    featureCount: project.nodes.filter((node) => node.type === "feature").length,
    riskCount: project.nodes.filter((node) => node.type === "risk").length,
    questionCount: project.clarificationQuestions.length,
    artifactCoverage: coverage,
    pillars,
    focusAreas,
    nextActions: nextActions.slice(0, 4)
  };
}

function pillar(id: string, label: string, value: number, max: number): ReadinessPillar {
  const ratio = max === 0 ? 1 : value / max;
  return {
    id,
    label,
    value,
    max,
    tone: ratio >= 0.75 ? "healthy" : ratio >= 0.4 ? "watch" : "critical"
  };
}
