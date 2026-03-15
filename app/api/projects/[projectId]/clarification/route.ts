import { projectService } from "@/lib/server/container";
import { failure, ok } from "@/lib/server/http";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const clarification = await projectService.planClarification(projectId);
    return ok(clarification);
  } catch (error) {
    return failure(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = (await request.json()) as { answers: Array<{ questionId: string; answer: string }> };
    const project = await projectService.submitClarificationAnswers(projectId, body.answers ?? []);
    return ok({ project });
  } catch (error) {
    console.error("[POST /api/projects/:projectId/clarification]", error);
    return failure(error);
  }
}
