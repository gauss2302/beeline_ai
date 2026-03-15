import { ProjectPageContent } from "@/components/screens/project-page-content";

export default async function ProjectReviewPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <ProjectPageContent projectId={projectId} view="presentation" />;
}
