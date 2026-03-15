"use client";

import { useRouter } from "next/navigation";
import { CheckSquare, KanbanSquare, Sparkles } from "lucide-react";
import { type ProjectRecord } from "@/lib/domain/contracts";
import { useWorkspaceStore } from "@/lib/state/workspace-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { projectViewHref } from "@/lib/routes";

export function BacklogScreen({ project }: { project: ProjectRecord }) {
  const router = useRouter();
  const generateArtifact = useWorkspaceStore((state) => state.generateArtifact);

  const stories = project.artifacts.find((artifact) => artifact.type === "user-stories");
  const acceptance = project.artifacts.find((artifact) => artifact.type === "acceptance-criteria");
  const features = project.nodes.filter((node) => node.type === "feature" || node.type === "requirement");

  return (
    <div className="space-y-4">
      <Card className="bg-mesh px-4 py-3 md:px-5 md:py-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <Badge>Backlog</Badge>
            <h2 className="mt-2 font-display text-xl leading-tight md:text-2xl">
              Delivery-ready slices
            </h2>
            <p className="mt-1 max-w-4xl text-sm leading-relaxed text-[color:var(--muted-foreground)]">
              User stories, acceptance criteria, and feature stack for delivery.
            </p>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 xl:mt-0">
            <Button variant="secondary" onClick={() => void generateArtifact("user-stories")}>
              <KanbanSquare className="h-4 w-4" />
              Generate Stories
            </Button>
            <Button variant="secondary" onClick={() => void generateArtifact("acceptance-criteria")}>
              <CheckSquare className="h-4 w-4" />
              Acceptance Criteria
            </Button>
            <Button variant="secondary" onClick={() => router.push(projectViewHref(project.id, "canvas"))}>
              Back to Canvas
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
        <div className="space-y-5">
          <ArtifactColumn
            title="User stories"
            description="Epic and story-level framing for PM and BA handoff."
            emptyLabel="Generate user stories from the current graph and project model."
            sections={stories?.sections}
            tone="stories"
          />
          <ArtifactColumn
            title="Acceptance criteria"
            description="Clear, testable outcomes that can drive QA and delivery alignment."
            emptyLabel="Generate acceptance criteria from refined features and requirements."
            sections={acceptance?.sections}
            tone="criteria"
          />
        </div>

        <div className="space-y-5">
          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Badge>Feature stack</Badge>
                <h3 className="mt-3 font-display text-[1.55rem]">Epics and requirement clusters</h3>
              </div>
              <Badge>{features.length}</Badge>
            </div>
            {features.length === 0 ? (
              <p className="text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                Add feature or requirement nodes on the canvas to build a stronger backlog structure.
              </p>
            ) : (
              <div className="space-y-3">
                {features.map((feature) => (
                  <div
                    key={feature.id}
                    className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Badge>{feature.type.replace("-", " ")}</Badge>
                      <Sparkles className="h-4 w-4 text-[color:var(--accent)]" />
                    </div>
                    <div className="mt-3 font-semibold">{feature.title}</div>
                    <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                      {feature.description || "Needs a clearer delivery description."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="space-y-3 bg-[color:var(--panel-muted)]">
            <Badge>Next move</Badge>
            <h3 className="font-display text-[1.4rem]">Keep board and backlog connected</h3>
            <p className="text-sm leading-relaxed text-[color:var(--muted-foreground)]">
              If the stories feel weak, go back to the canvas, expand the feature branch, and regenerate only the
              backlog artifacts you need.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ArtifactColumn({
  title,
  description,
  emptyLabel,
  sections,
  tone
}: {
  title: string;
  description: string;
  emptyLabel: string;
  sections: { id: string; title: string; content: string; sourceFields: string[] }[] | undefined;
  tone: "stories" | "criteria";
}) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Badge>{title}</Badge>
          <h3 className="mt-3 font-display text-[1.55rem]">{description}</h3>
        </div>
        <Badge>{sections?.length ?? 0}</Badge>
      </div>

      {!sections?.length ? (
        <div className="rounded-[1.4rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-4 text-sm text-[color:var(--muted-foreground)]">
          {emptyLabel}
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-display text-[1.35rem]">{section.title}</div>
                <Badge className={tone === "stories" ? "bg-[color:var(--panel)] text-foreground" : "bg-[color:oklch(0.94_0.04_145)] text-foreground"}>
                  {section.sourceFields.length} sources
                </Badge>
              </div>
              <div className="ProseMirror mt-4 min-h-0" dangerouslySetInnerHTML={{ __html: section.content }} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
