import { type WorkspaceSummary } from "@/lib/domain/contracts";

export const DEFAULT_OWNER_ID = "owner-analyst-os";
export const DEFAULT_WORKSPACE_ID = "workspace-default";

export const DEFAULT_WORKSPACE: WorkspaceSummary = {
  id: DEFAULT_WORKSPACE_ID,
  title: "Discovery Portfolio",
  description: "A workspace for AI-assisted product discovery and requirements shaping."
};
