import { projectService } from "@/lib/server/container";
import { failure, ok } from "@/lib/server/http";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const project = await projectService.getProject(projectId);
    if (!project) {
      return failure(new Error("Project not found"), 404);
    }

    return ok({ project });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = (await request.json()) as {
      title?: string;
      summary?: string;
      model?: Record<string, unknown>;
    };

    const project = await projectService.updateProject(projectId, {
      title: body.title,
      summary: body.summary,
      model: body.model as never
    });
    return ok({ project });
  } catch (error) {
    return failure(error);
  }
}
