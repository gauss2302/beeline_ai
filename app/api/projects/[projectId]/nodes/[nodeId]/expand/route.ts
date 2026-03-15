import { projectService } from "@/lib/server/container";
import { failure, ok } from "@/lib/server/http";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; nodeId: string }> }
) {
  try {
    const { projectId, nodeId } = await params;
    const result = await projectService.expandNode(projectId, nodeId);
    return ok(result);
  } catch (error) {
    return failure(error);
  }
}
