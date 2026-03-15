import { artifactService } from "@/lib/server/container";
import { failure, ok } from "@/lib/server/http";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ artifactId: string; sectionId: string }> }
) {
  try {
    const { artifactId, sectionId } = await params;
    const artifact = await artifactService.regenerateSection({
      artifactId,
      sectionId
    });
    return ok({ artifact });
  } catch (error) {
    return failure(error);
  }
}
