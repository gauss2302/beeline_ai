import { runStructuredPrompt, z } from "@/lib/ai/client";
import { type ArtifactDraft, type ArtifactKind, type ProjectRecord } from "@/lib/domain/contracts";

const sectionSchema = z.object({
  key: z.string(),
  title: z.string(),
  content: z.string(),
  sourceFields: z.array(
    z.enum([
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
    ])
  ),
  sourceNodeIds: z.array(z.string())
});

const artifactSchema = z.object({
  title: z.string(),
  summary: z.string(),
  sections: z.array(sectionSchema)
});

export async function artifactGenerator({
  project,
  type,
  fallbackDraft
}: {
  project: ProjectRecord;
  type: ArtifactKind;
  fallbackDraft: ArtifactDraft;
}): Promise<ArtifactDraft> {
  return runStructuredPrompt({
    name: `${type}_artifact`,
    prompt: `You are generating a ${type.toUpperCase()} for a business analyst workspace.

Project:
${JSON.stringify(
  {
    title: project.title,
    summary: project.summary,
    model: project.model,
    warnings: project.validationWarnings
  },
  null,
  2
)}

Return HTML strings for each section using only paragraphs, headings, ordered lists, unordered lists, and strong tags.
Make the wording direct, structured, and enterprise-ready.`,
    jsonSchema: {
      type: "object",
      additionalProperties: false,
      required: ["title", "summary", "sections"],
      properties: {
        title: { type: "string" },
        summary: { type: "string" },
        sections: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["key", "title", "content", "sourceFields", "sourceNodeIds"],
            properties: {
              key: { type: "string" },
              title: { type: "string" },
              content: { type: "string" },
              sourceFields: {
                type: "array",
                items: {
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
                }
              },
              sourceNodeIds: {
                type: "array",
                items: { type: "string" }
              }
            }
          }
        }
      }
    },
    outputSchema: artifactSchema,
    fallback: () => fallbackDraft
  });
}
