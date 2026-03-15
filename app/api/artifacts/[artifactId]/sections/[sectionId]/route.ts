import { artifactService } from "@/lib/server/container";
import { failure, ok } from "@/lib/server/http";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ artifactId: string; sectionId: string }> }
) {
  try {
    const { artifactId, sectionId } = await params;
    const body = (await request.json()) as { content: string };
    const artifact = await artifactService.updateSection({
      artifactId,
      sectionId,
      content: body.content
    });
    return ok({ artifact });
  } catch (error) {
    return failure(error);
  }
}
