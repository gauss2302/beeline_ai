import {
  type ArtifactDraft,
  type ArtifactKind,
  type ArtifactSectionDraft,
  type ProjectModel,
  type ProjectNode
} from "@/lib/domain/contracts";

export function buildArtifactDraft(
  type: ArtifactKind,
  model: ProjectModel,
  nodes: ProjectNode[]
): ArtifactDraft {
  switch (type) {
    case "brd":
      return buildBrdDraft(model, nodes);
    case "prd":
      return buildPrdDraft(model, nodes);
    case "user-stories":
      return buildUserStoriesDraft(model);
    case "acceptance-criteria":
      return buildAcceptanceCriteriaDraft(model);
  }
}

function buildBrdDraft(model: ProjectModel, nodes: ProjectNode[]): ArtifactDraft {
  const featureNodes = nodes.filter((node) => node.type === "feature");
  const sections: ArtifactSectionDraft[] = [
    section("business-context", "Business Context", paragraph(model.summary || model.problemStatement), ["summary", "problemStatement"], []),
    section("problem-statement", "Problem Statement", paragraph(model.problemStatement), ["problemStatement"], []),
    section("objectives", "Objectives", bulletList([model.businessObjective, ...model.successMetrics]), ["businessObjective", "successMetrics"], []),
    section("stakeholders", "Stakeholders", bulletList(model.stakeholders), ["stakeholders"], nodeIds(nodes, "stakeholder")),
    section("scope", "Scope", dualList("In Scope", model.scopeIn.length ? model.scopeIn : featureNodes.map((node) => node.title), "Out of Scope", model.scopeOut), ["scopeIn", "scopeOut"], featureNodes.map((node) => node.id)),
    section("constraints-risks", "Constraints And Risks", dualList("Constraints", model.constraints, "Risks", model.risks), ["constraints", "risks"], nodeIds(nodes, "constraint").concat(nodeIds(nodes, "risk"))),
    section("kpis", "KPIs And Success Metrics", bulletList(model.successMetrics), ["successMetrics"], nodeIds(nodes, "metric"))
  ];

  return {
    title: `${model.title || "Project"} Business Requirements Document`,
    summary: "A business-aligned view of the opportunity, scope, risks, and success measures.",
    sections
  };
}

function buildPrdDraft(model: ProjectModel, nodes: ProjectNode[]): ArtifactDraft {
  const featureNodes = nodes.filter((node) => node.type === "feature");
  const requirementNodes = nodes.filter((node) => node.type === "requirement");
  const sections: ArtifactSectionDraft[] = [
    section("overview", "Product Overview", paragraph(model.summary), ["summary"], []),
    section("problem-definition", "Problem Definition", paragraph(model.problemStatement), ["problemStatement"], nodeIds(nodes, "problem")),
    section("goals", "Goals", bulletList([model.businessObjective, ...model.successMetrics]), ["businessObjective", "successMetrics"], nodeIds(nodes, "goal")),
    section("target-users", "Target Users", bulletList(model.targetUsers), ["targetUsers"], nodeIds(nodes, "user")),
    section(
      "feature-requirements",
      "Feature Requirements",
      bulletList(
        (model.functionalRequirements.length ? model.functionalRequirements : featureNodes.map((node) => node.title)).concat(
          requirementNodes.map((node) => `${node.title}${node.description ? `: ${node.description}` : ""}`)
        )
      ),
      ["functionalRequirements"],
      featureNodes.concat(requirementNodes).map((node) => node.id)
    ),
    section("flows", "Flows And Journeys", bulletList(buildFlows(model, featureNodes)), ["functionalRequirements", "targetUsers"], featureNodes.map((node) => node.id)),
    section("edge-cases", "Edge Cases", bulletList(model.openQuestions), ["openQuestions"], nodeIds(nodes, "open-question")),
    section("dependencies", "Dependencies And NFRs", dualList("Dependencies", model.dependencies, "Non-functional Requirements", model.nonFunctionalRequirements), ["dependencies", "nonFunctionalRequirements"], []),
    section("success-criteria", "Success Criteria", bulletList(model.successMetrics), ["successMetrics"], nodeIds(nodes, "metric"))
  ];

  return {
    title: `${model.title || "Project"} Product Requirements Document`,
    summary: "A product-facing operating document derived from the canonical project model.",
    sections
  };
}

function buildUserStoriesDraft(model: ProjectModel): ArtifactDraft {
  const stories = (model.functionalRequirements.length ? model.functionalRequirements : model.scopeIn).map((item, index) => {
    const user = model.targetUsers[index % Math.max(model.targetUsers.length, 1)] ?? "stakeholder";
    return `As a ${user}, I want ${stripLead(item)} so that ${model.businessObjective || "the workflow achieves the intended business outcome"}.`;
  });

  return {
    title: `${model.title || "Project"} User Stories`,
    summary: "Feature-oriented user stories derived from prioritized requirements.",
    sections: [section("stories", "Stories", bulletList(stories), ["functionalRequirements", "targetUsers", "businessObjective"], [])]
  };
}

function buildAcceptanceCriteriaDraft(model: ProjectModel): ArtifactDraft {
  const criteria = (model.functionalRequirements.length ? model.functionalRequirements : model.scopeIn).map((item, index) => [
    `Given the ${stripLead(item)} flow is available`,
    `When a ${model.targetUsers[index % Math.max(model.targetUsers.length, 1)] ?? "user"} completes the required input`,
    "Then the system responds with a clear, testable outcome and auditable state change"
  ]);

  return {
    title: `${model.title || "Project"} Acceptance Criteria`,
    summary: "Checklist-style acceptance criteria suitable for refinement with engineering and QA.",
    sections: criteria.map((items, index) =>
      section(`criteria-${index + 1}`, `Acceptance Criteria ${index + 1}`, checklist(items), ["functionalRequirements", "targetUsers"], [])
    )
  };
}

function buildFlows(model: ProjectModel, featureNodes: ProjectNode[]): string[] {
  if (featureNodes.length === 0) {
    return model.functionalRequirements.map((item) => `Primary flow for ${stripLead(item)}`);
  }

  return featureNodes.map((node) => {
    const actor = model.targetUsers[0] ?? "user";
    return `${actor} enters ${node.title.toLowerCase()}, completes the key action, and receives visible confirmation with the right access and follow-up.`;
  });
}

function stripLead(value: string): string {
  return value.replace(/^[A-Z][^:]+:\s*/, "").trim();
}

function section(
  key: string,
  title: string,
  content: string,
  sourceFields: ArtifactSectionDraft["sourceFields"],
  sourceNodeIds: string[]
): ArtifactSectionDraft {
  return {
    key,
    title,
    content,
    sourceFields,
    sourceNodeIds
  };
}

function paragraph(value: string): string {
  return `<p>${value || "Pending clarification."}</p>`;
}

function bulletList(items: Array<string | undefined>): string {
  const filtered = items.map((item) => item?.trim()).filter(Boolean) as string[];
  if (filtered.length === 0) {
    return "<p>Pending clarification.</p>";
  }

  return `<ul>${filtered.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function checklist(items: string[]): string {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function dualList(leftTitle: string, leftItems: string[], rightTitle: string, rightItems: string[]): string {
  return `
    <h3>${leftTitle}</h3>
    ${bulletList(leftItems)}
    <h3>${rightTitle}</h3>
    ${bulletList(rightItems)}
  `;
}

function nodeIds(nodes: ProjectNode[], type: ProjectNode["type"]): string[] {
  return nodes.filter((node) => node.type === type).map((node) => node.id);
}
