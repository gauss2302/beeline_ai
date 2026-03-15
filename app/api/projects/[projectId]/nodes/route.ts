import { projectService } from "@/lib/server/container";
import { failure, ok } from "@/lib/server/http";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = (await request.json()) as {
      type: string;
      title: string;
      description?: string;
      x?: number;
      y?: number;
      sourceField?: string;
    };
    const project = await projectService.createNode({
      projectId,
      type: body.type as never,
      title: body.title,
      description: body.description,
      x: body.x,
      y: body.y,
      sourceField: body.sourceField as never
    });

    return ok({ project });
  } catch (error) {
    console.error("[POST /api/projects/:projectId/nodes]", error);
    return failure(error);
  }
}
