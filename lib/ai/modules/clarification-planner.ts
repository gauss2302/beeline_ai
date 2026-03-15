import { runStructuredPrompt, z } from "@/lib/ai/client";
import { type ClarificationPlan, type ProjectRecord } from "@/lib/domain/contracts";

const clarificationSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      prompt: z.string(),
      field: z.enum([
        "title",
        "summary",
        "problemStatement",
        "businessObjective",
        "stakeholders",
        "targetUsers",
        "userPainPoints",
        "scopeIn",
        "scopeOut",
        "assumptions",
        "constraints",
        "risks",
        "successMetrics",
        "functionalRequirements",
        "nonFunctionalRequirements",
        "dependencies",
        "openQuestions"
      ]),
      rationale: z.string(),
      nodeIds: z.array(z.string()),
      priority: z.enum(["high", "medium", "low"])
    })
  )
});

export async function clarificationPlanner(project: ProjectRecord): Promise<ClarificationPlan> {
  const condensed = JSON.stringify(
    {
      model: project.model,
      warnings: project.validationWarnings,
      nodes: project.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        title: node.title
      }))
    },
    null,
    2
  );

  return runStructuredPrompt({
    name: "clarification_plan",
    prompt: `You are creating a focused discovery plan for a business analyst workspace.

Return at most 5 high-impact questions. Avoid generic conversation.
Prioritize missing business context, users, scope, risks, metrics, and rules.

Project snapshot:
${condensed}`,
    jsonSchema: {
      type: "object",
      additionalProperties: false,
      required: ["questions"],
      properties: {
        questions: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id", "prompt", "field", "rationale", "nodeIds", "priority"],
            properties: {
              id: { type: "string" },
              prompt: { type: "string" },
              field: {
                type: "string",
                enum: [
                  "title",
                  "summary",
                  "problemStatement",
                  "businessObjective",
                  "stakeholders",
                  "targetUsers",
                  "userPainPoints",
                  "scopeIn",
                  "scopeOut",
                  "assumptions",
                  "constraints",
                  "risks",
                  "successMetrics",
                  "functionalRequirements",
                  "nonFunctionalRequirements",
                  "dependencies",
                  "openQuestions"
                ]
              },
              rationale: { type: "string" },
              nodeIds: { type: "array", items: { type: "string" } },
              priority: { type: "string", enum: ["high", "medium", "low"] }
            }
          }
        }
      }
    },
    outputSchema: clarificationSchema,
    fallback: () => mockClarification(project)
  });
}

function mockClarification(project: ProjectRecord): ClarificationPlan {
  const questions = [];

  if (!project.model.targetUsers.length) {
    questions.push({
      id: "target-users",
      prompt: "Who are the primary user roles and how do their responsibilities differ?",
      field: "targetUsers" as const,
      rationale: "Requirements are too generic without clear actors.",
      nodeIds: project.nodes.filter((node) => node.type === "user").map((node) => node.id),
      priority: "high" as const
    });
  }

  if (!project.model.successMetrics.length) {
    questions.push({
      id: "success-metrics",
      prompt: "Which measurable business outcomes will define success in the first release?",
      field: "successMetrics" as const,
      rationale: "The project needs KPI alignment before scope grows.",
      nodeIds: project.nodes.filter((node) => node.type === "goal" || node.type === "metric").map((node) => node.id),
      priority: "high" as const
    });
  }

  questions.push({
    id: "scope-boundary",
    prompt: "What is explicitly out of scope for the MVP so the first release stays narrow?",
    field: "scopeOut" as const,
    rationale: "Clear exclusions reduce discovery sprawl and strengthen the PRD.",
    nodeIds: project.nodes.filter((node) => node.type === "feature" || node.type === "constraint").map((node) => node.id),
    priority: "medium" as const
  });

  questions.push({
    id: "critical-risk",
    prompt: "Which policy, compliance, or operational risk would make this initiative fail if ignored?",
    field: "risks" as const,
    rationale: "High-stakes risks should be captured before formalizing requirements.",
    nodeIds: project.nodes.filter((node) => node.type === "risk" || node.type === "constraint").map((node) => node.id),
    priority: "medium" as const
  });

  return {
    questions: questions.slice(0, 5)
  };
}
