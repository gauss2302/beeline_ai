import { type ProjectRecord, type ValidationWarning } from "@/lib/domain/contracts";
import { validateProjectModel } from "@/lib/domain/project-model";

export function qualityChecker(project: ProjectRecord): ValidationWarning[] {
  return validateProjectModel(project.model);
}
