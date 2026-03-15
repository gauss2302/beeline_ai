import { runStructuredPrompt, z } from "@/lib/ai/client";
import { type CreateProjectInput, type IntakeAnalysis } from "@/lib/domain/contracts";

const intakeSchema = z.object({
  title: z.string().min(3),
  summary: z.string().min(10),
  problemStatement: z.string().min(10),
  businessObjective: z.string().min(10),
  stakeholders: z.array(z.string()).min(1),
  targetUsers: z.array(z.string()).min(1)
});

export async function intakeAnalyzer(input: CreateProjectInput): Promise<IntakeAnalysis> {
  return runStructuredPrompt({
    name: "intake_analysis",
    prompt: `You are an expert business analyst. Convert the vague idea into a structured discovery brief for a new project that should start with a single idea node.

Idea:
${input.idea}

Return:
- project title
- concise summary
- problem statement
- business objective
- stakeholders
- target users`,
    jsonSchema: {
      type: "object",
      additionalProperties: false,
      required: [
        "title",
        "summary",
        "problemStatement",
        "businessObjective",
        "stakeholders",
        "targetUsers"
      ],
      properties: {
        title: { type: "string" },
        summary: { type: "string" },
        problemStatement: { type: "string" },
        businessObjective: { type: "string" },
        stakeholders: { type: "array", items: { type: "string" } },
        targetUsers: { type: "array", items: { type: "string" } }
      }
    },
    outputSchema: intakeSchema,
    fallback: () => mockIntake(input)
  });
}

function mockIntake(input: CreateProjectInput): IntakeAnalysis {
  const idea = input.idea.trim();
  const normalizedTitle =
    input.title ??
    idea
      .replace(/^we need\s+/i, "")
      .replace(/^we want\s+/i, "")
      .replace(/^build\s+/i, "")
      .replace(/\.$/, "")
      .replace(/\b\w/g, (match) => match.toUpperCase());

  return {
    title: normalizedTitle || "Discovery Workspace",
    summary: `Discovery workspace for ${idea}. The goal is to turn the initial concept into clear product and business requirements.`,
    problemStatement: `The current process around ${idea} is underspecified, which creates ambiguity in scope, stakeholders, and success criteria.`,
    businessObjective: `Define a decision-ready requirements baseline for ${idea} and reduce ambiguity before delivery planning starts.`,
    stakeholders: ["Business sponsor", "Operations lead", "Product owner"],
    targetUsers: ["Primary end user", "Approver or reviewer", "Administrator"]
  };
}
