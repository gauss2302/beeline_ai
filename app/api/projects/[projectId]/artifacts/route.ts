import { artifactService } from "@/lib/server/container";
import { failure, ok } from "@/lib/server/http";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = (await request.json()) as { type: "brd" | "prd" | "user-stories" | "acceptance-criteria" };
    const artifact = await artifactService.generate(projectId, body.type);
    return ok({ artifact });
  } catch (error) {
    return failure(error);
  }
}
