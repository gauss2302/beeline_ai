import {
  type CreateProjectInput,
  type IntakeAnalysis,
  type ProjectModel,
  type ProjectNode,
  type ProjectNodeKind,
  type ProjectRecord,
  type ValidationWarning
} from "@/lib/domain/contracts";

const fieldMapByNodeType: Record<ProjectNodeKind, keyof ProjectModel | null> = {
  idea: "summary",
  problem: "problemStatement",
  user: "targetUsers",
  stakeholder: "stakeholders",
  goal: "successMetrics",
  feature: "functionalRequirements",
  requirement: "functionalRequirements",
  constraint: "constraints",
  risk: "risks",
  metric: "successMetrics",
  assumption: "assumptions",
  "open-question": "openQuestions"
};

export function createEmptyProjectModel(idea?: string): ProjectModel {
  return {
    title: "",
    summary: idea ?? "",
    problemStatement: "",
    businessObjective: "",
    stakeholders: [],
    targetUsers: [],
    userPainPoints: [],
    scopeIn: [],
    scopeOut: [],
    assumptions: [],
    constraints: [],
    risks: [],
    successMetrics: [],
    functionalRequirements: [],
    nonFunctionalRequirements: [],
    dependencies: [],
    openQuestions: []
  };
}

export function buildSeedModel(input: CreateProjectInput, intake: IntakeAnalysis): ProjectModel {
  return {
    ...createEmptyProjectModel(input.idea),
    title: intake.title,
    summary: intake.summary,
    problemStatement: intake.problemStatement,
    businessObjective: intake.businessObjective,
    stakeholders: intake.stakeholders,
    targetUsers: intake.targetUsers
  };
}

export function deriveProjectModelFromNodes(project: ProjectRecord): ProjectModel {
  const nextModel: ProjectModel = {
    ...project.model,
    title: project.title,
    summary: firstNonEmpty(project.nodes.filter((node) => node.type === "idea").map((node) => node.description), project.summary),
    stakeholders: [...project.model.stakeholders],
    targetUsers: [...project.model.targetUsers],
    userPainPoints: [...project.model.userPainPoints],
    scopeIn: [...project.model.scopeIn],
    scopeOut: [...project.model.scopeOut],
    assumptions: [...project.model.assumptions],
    constraints: [...project.model.constraints],
    risks: [...project.model.risks],
    successMetrics: [...project.model.successMetrics],
    functionalRequirements: [...project.model.functionalRequirements],
    nonFunctionalRequirements: [...project.model.nonFunctionalRequirements],
    dependencies: [...project.model.dependencies],
    openQuestions: [...project.model.openQuestions]
  };

  for (const node of project.nodes) {
    const field = node.sourceField ?? fieldMapByNodeType[node.type];
    const value = `${node.title}${node.description ? `: ${node.description}` : ""}`.trim();

    if (!field) {
      continue;
    }

    if (field === "problemStatement" || field === "summary") {
      nextModel[field] = firstNonEmpty([node.description, node.title], nextModel[field]);
      continue;
    }

    const target = nextModel[field];
    if (Array.isArray(target) && value && !target.includes(value)) {
      target.push(value);
    }
  }

  if (!nextModel.businessObjective) {
    const goalNode = project.nodes.find((node) => node.type === "goal");
    nextModel.businessObjective = goalNode
      ? `${goalNode.title}${goalNode.description ? `: ${goalNode.description}` : ""}`
      : project.model.businessObjective;
  }

  return nextModel;
}

export function validateProjectModel(model: ProjectModel): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (!model.problemStatement.trim()) {
    warnings.push({
      id: "missing-problem",
      severity: "critical",
      title: "Problem statement missing",
      message: "Capture the business problem before expanding delivery details.",
      field: "problemStatement"
    });
  }

  if (model.targetUsers.length === 0) {
    warnings.push({
      id: "missing-users",
      severity: "critical",
      title: "Target users missing",
      message: "Projects with no target users tend to generate generic and weak requirements.",
      field: "targetUsers"
    });
  }

  if (model.successMetrics.length === 0) {
    warnings.push({
      id: "missing-metrics",
      severity: "warning",
      title: "No success metrics defined",
      message: "Features without measurable outcomes will be hard to evaluate.",
      field: "successMetrics"
    });
  }

  if (model.functionalRequirements.length > 0 && model.openQuestions.length > 0) {
    warnings.push({
      id: "open-questions-remain",
      severity: "warning",
      title: "Open questions remain unresolved",
      message: "Regenerate artifacts after resolving high-priority discovery questions.",
      field: "openQuestions"
    });
  }

  const vagueRequirements = model.functionalRequirements.filter((item) =>
    /\b(flexible|easy|fast|simple|modern|intuitive)\b/i.test(item)
  );
  if (vagueRequirements.length > 0) {
    warnings.push({
      id: "vague-requirements",
      severity: "warning",
      title: "Vague requirement wording detected",
      message: "Replace subjective wording with testable outcomes and explicit rules.",
      field: "functionalRequirements"
    });
  }

  return warnings;
}

export function projectSummaryFromModel(model: ProjectModel): string {
  return model.summary || model.problemStatement || "Untitled discovery project";
}

function firstNonEmpty(values: Array<string | undefined>, fallback = ""): string {
  return values.find((value) => Boolean(value?.trim()))?.trim() ?? fallback;
}
