import { projectService } from "@/lib/server/container";
import { failure, ok } from "@/lib/server/http";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const project = await projectService.syncProjectModel(projectId);
    return ok({ project });
  } catch (error) {
    return failure(error);
  }
}
