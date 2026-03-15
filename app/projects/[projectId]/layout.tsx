import { ProjectRouteLayout } from "@/components/app-shell/project-route-layout";

export default async function ProjectLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <ProjectRouteLayout projectId={projectId}>
      {children}
    </ProjectRouteLayout>
  );
}
