import {
  type ArtifactDraft,
  type ArtifactKind,
  type ClarificationPlan,
  type CreateProjectInput,
  type IntakeAnalysis,
  type NodeExpansionOutput,
  type ProjectRecord
} from "@/lib/domain/contracts";
import { buildArtifactDraft } from "@/lib/domain/artifacts";
import { deriveProjectModelFromNodes, validateProjectModel } from "@/lib/domain/project-model";
import { artifactGenerator } from "@/lib/ai/modules/artifact-generator";
import { clarificationPlanner } from "@/lib/ai/modules/clarification-planner";
import { intakeAnalyzer } from "@/lib/ai/modules/intake-analyzer";
import { nodeExpander } from "@/lib/ai/modules/node-expander";

export class AnalystOrchestrator {
  async analyzeIntake(input: CreateProjectInput): Promise<IntakeAnalysis> {
    return intakeAnalyzer(input);
  }

  async expandNode(project: ProjectRecord, nodeId: string): Promise<NodeExpansionOutput> {
    return nodeExpander(project, nodeId);
  }

  async planClarification(project: ProjectRecord): Promise<ClarificationPlan> {
    const syncedModel = deriveProjectModelFromNodes(project);
    return clarificationPlanner({
      ...project,
      model: syncedModel,
      validationWarnings: validateProjectModel(syncedModel)
    });
  }

  async generateArtifact(project: ProjectRecord, type: ArtifactKind): Promise<ArtifactDraft> {
    const syncedModel = deriveProjectModelFromNodes(project);
    const fallbackDraft = buildArtifactDraft(type, syncedModel, project.nodes);

    return artifactGenerator({
      project: {
        ...project,
        model: syncedModel,
        validationWarnings: validateProjectModel(syncedModel)
      },
      type,
      fallbackDraft
    });
  }
}
