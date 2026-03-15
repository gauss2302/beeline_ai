import { projectService } from "@/lib/server/container";
import { failure, ok } from "@/lib/server/http";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = (await request.json()) as { source: string; target: string; label?: string };
    const project = await projectService.connectNodes({
      projectId,
      source: body.source,
      target: body.target,
      label: body.label
    });
    return ok({ project });
  } catch (error) {
    return failure(error);
  }
}
