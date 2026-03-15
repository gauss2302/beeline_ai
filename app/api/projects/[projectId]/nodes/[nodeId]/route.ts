import { projectService } from "@/lib/server/container";
import { failure, ok } from "@/lib/server/http";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string; nodeId: string }> }
) {
  try {
    const { projectId, nodeId } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const project = await projectService.updateNode({
      projectId,
      nodeId,
      type: body.type as never,
      title: body.title as string | undefined,
      description: body.description as string | undefined,
      details: body.details as string | undefined,
      x: body.x as number | undefined,
      y: body.y as number | undefined,
      tags: body.tags as string[] | undefined,
      sourceField: (body.sourceField as string | null | undefined) as never
    });

    return ok({ project });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; nodeId: string }> }
) {
  try {
    const { projectId, nodeId } = await params;
    const project = await projectService.deleteNode(projectId, nodeId);
    return ok({ project });
  } catch (error) {
    return failure(error);
  }
}
