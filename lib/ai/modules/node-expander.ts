import { runStructuredPrompt, z } from "@/lib/ai/client";
import { type NodeExpansionOutput, type ProjectRecord } from "@/lib/domain/contracts";

const expansionSchema = z.object({
  parentNodeId: z.string(),
  suggestions: z.array(
    z.object({
      type: z.enum([
        "problem",
        "stakeholder",
        "user",
        "goal",
        "feature",
        "requirement",
        "constraint",
        "risk",
        "metric",
        "assumption",
        "open-question"
      ]),
      title: z.string().min(2),
      description: z.string().min(4),
      relationLabel: z.string().optional()
    })
  )
});

export async function nodeExpander(project: ProjectRecord, nodeId: string): Promise<NodeExpansionOutput> {
  const node = project.nodes.find((item) => item.id === nodeId);
  if (!node) {
    return { parentNodeId: nodeId, suggestions: [] };
  }

  return runStructuredPrompt({
    name: "node_expansion",
    prompt: `You are expanding one node in a business analyst planning graph.

Project title: ${project.title}
Project summary: ${project.summary}

Node type: ${node.type}
Node title: ${node.title}
Node description: ${node.description}

Return 3 to 5 useful child nodes that make the topic more specific, testable, or decision-ready.
Prefer concrete sub-concepts over generic statements.`,
    jsonSchema: {
      type: "object",
      additionalProperties: false,
      required: ["parentNodeId", "suggestions"],
      properties: {
        parentNodeId: { type: "string" },
        suggestions: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["type", "title", "description"],
            properties: {
              type: {
                type: "string",
                enum: [
                  "problem",
                  "stakeholder",
                  "user",
                  "goal",
                  "feature",
                  "requirement",
                  "constraint",
                  "risk",
                  "metric",
                  "assumption",
                  "open-question"
                ]
              },
              title: { type: "string" },
              description: { type: "string" },
              relationLabel: { type: "string" }
            }
          }
        }
      }
    },
    outputSchema: expansionSchema,
    fallback: () => mockExpansion(project, nodeId)
  });
}

function mockExpansion(project: ProjectRecord, nodeId: string): NodeExpansionOutput {
  const node = project.nodes.find((item) => item.id === nodeId);
  if (!node) {
    return { parentNodeId: nodeId, suggestions: [] };
  }

  const byType = {
    feature: [
      ["Entry points", "requirement", "Define how the feature is accessed and who initiates it."],
      ["Decision rules", "requirement", "Clarify approval logic, thresholds, and branching conditions."],
      ["Exception handling", "risk", "Identify failure paths, overrides, and escalation paths."],
      ["Success metrics", "metric", "Specify what success looks like once the feature is live."]
    ],
    problem: [
      ["Current pain", "user", "Who experiences the pain and where does it surface?"],
      ["Operational cost", "metric", "Estimate time loss, risk, or manual effort created today."],
      ["Root causes", "assumption", "Name the assumptions behind the current problem framing."]
    ],
    goal: [
      ["Primary KPI", "metric", "Define a measurable indicator for this goal."],
      ["Leading indicator", "metric", "Identify the early signal that progress is improving."],
      ["Dependencies", "constraint", "Capture what must be true for the goal to be achievable."]
    ],
    default: [
      ["User perspective", "user", "Which user role is most affected by this node?"],
      ["Business rule", "requirement", "What rule or logic must be explicit here?"],
      ["Open issue", "open-question", "What critical unknown still blocks confident planning?"]
    ]
  } as const;

  const suggestions = (byType[node.type as keyof typeof byType] ?? byType.default).map(([title, type, description]) => ({
    type,
    title: `${node.title} · ${title}`,
    description,
    relationLabel: "expands"
  }));

  return {
    parentNodeId: nodeId,
    suggestions
  };
}
