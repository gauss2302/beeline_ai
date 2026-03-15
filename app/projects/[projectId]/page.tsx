import type { Route } from "next";
import { redirect } from "next/navigation";

export default async function ProjectIndexPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/projects/${projectId}/canvas` as Route);
}
