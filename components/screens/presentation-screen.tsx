"use client";

import { useRouter } from "next/navigation";
import { Eye, FileOutput, ShieldCheck, Target } from "lucide-react";
import { type ProjectRecord } from "@/lib/domain/contracts";
import { deriveProjectAnalytics } from "@/lib/domain/analytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { projectViewHref } from "@/lib/routes";

export function PresentationScreen({ project }: { project: ProjectRecord }) {
  const router = useRouter();
  const analytics = deriveProjectAnalytics(project);

  const reviewArtifacts = project.artifacts.filter((artifact) => artifact.type === "brd" || artifact.type === "prd");

  return (
    <div className="space-y-4">
      <Card className="bg-mesh px-4 py-3 md:px-5 md:py-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Review</Badge>
              <Badge className="border-[color:var(--border)] bg-[color:var(--panel)] text-foreground">{analytics.readinessScore}%</Badge>
            </div>
            <h2 className="mt-2 font-display text-xl leading-tight md:text-2xl">{project.title}</h2>
            <p className="mt-1 max-w-4xl text-sm leading-relaxed text-[color:var(--muted-foreground)] line-clamp-2">
              {project.summary || project.idea}
            </p>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 xl:mt-0">
            <Button variant="secondary" onClick={() => router.push(projectViewHref(project.id, "artifacts"))}>
              <FileOutput className="h-4 w-4" />
              Open Artifact Studio
            </Button>
            <Button variant="secondary" onClick={() => router.push(projectViewHref(project.id, "canvas"))}>
              <Eye className="h-4 w-4" />
              Return to Canvas
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,340px)]">
        <div className="space-y-5">
          <Card className="space-y-4">
            <Badge>Business snapshot</Badge>
            <h3 className="font-display text-[1.6rem]">What this initiative is solving</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <SnapshotBlock title="Problem statement" value={project.model.problemStatement || "Still being clarified."} />
              <SnapshotBlock title="Business objective" value={project.model.businessObjective || "Still being clarified."} />
              <SnapshotBlock
                title="Target users"
                value={project.model.targetUsers.length ? project.model.targetUsers.join(", ") : "No user groups mapped yet."}
              />
              <SnapshotBlock
                title="Success metrics"
                value={project.model.successMetrics.length ? project.model.successMetrics.join(", ") : "No KPIs mapped yet."}
              />
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Badge>Review documents</Badge>
                <h3 className="mt-3 font-display text-[1.6rem]">Document previews</h3>
              </div>
              <Badge>{reviewArtifacts.length}</Badge>
            </div>
            {reviewArtifacts.length === 0 ? (
              <p className="text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                BRD and PRD are not generated yet. Use the document studio when you are ready for stakeholder outputs.
              </p>
            ) : (
              <div className="space-y-4">
                {reviewArtifacts.map((artifact) => (
                  <div
                    key={artifact.id}
                    className="rounded-[1.45rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-display text-[1.35rem]">{artifact.title}</div>
                      <Badge>{artifact.sections.length} sections</Badge>
                    </div>
                    <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{artifact.summary}</p>
                    {artifact.sections[0] ? (
                      <div
                        className="ProseMirror mt-4 min-h-0"
                        dangerouslySetInnerHTML={{ __html: artifact.sections[0].content }}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[color:var(--accent)]" />
              <h3 className="font-display text-[1.5rem]">Readiness and confidence</h3>
            </div>
            <div className="grid gap-3">
              <ReviewMetric label="Readiness" value={`${analytics.readinessScore}%`} />
              <ReviewMetric label="Mapped risks" value={`${analytics.riskCount}`} />
              <ReviewMetric label="Open questions" value={`${analytics.questionCount}`} />
              <ReviewMetric label="Artifacts coverage" value={`${analytics.artifactCoverage}%`} />
            </div>
          </Card>

          <Card className="space-y-4 bg-[color:var(--panel-muted)]">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[color:var(--accent)]" />
              <h3 className="font-display text-[1.5rem]">Stakeholder notes</h3>
            </div>
            <p className="text-sm leading-relaxed text-[color:var(--muted-foreground)]">
              This view strips away most editing chrome and keeps the project in a review-friendly format. It is intended
              for read-throughs, alignment meetings, and sign-off conversations.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SnapshotBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">{title}</div>
      <div className="mt-3 text-sm leading-relaxed">{value}</div>
    </div>
  );
}

function ReviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.3rem] border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_92%,white)] px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">{label}</div>
      <div className="mt-2 font-display text-[1.7rem] leading-none">{value}</div>
    </div>
  );
}
