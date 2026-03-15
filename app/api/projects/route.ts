import { projectService } from "@/lib/server/container";
import { failure, ok } from "@/lib/server/http";

export async function GET() {
  try {
    const projects = await projectService.listProjects();
    return ok({ projects });
  } catch (error) {
    console.error("[GET /api/projects]", error);
    return failure(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { idea?: string; title?: string };
    if (!body.idea?.trim()) {
      return failure(new Error("Idea is required"), 400);
    }

    const project = await projectService.createProject({
      idea: body.idea.trim(),
      title: body.title?.trim()
    });
    return ok({ project });
  } catch (error) {
    console.error("[POST /api/projects]", error);
    return failure(error);
  }
}
