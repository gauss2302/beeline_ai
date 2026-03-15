"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, FileOutput, Network, ShieldAlert, Sparkles, Target } from "lucide-react";
import { type ProjectRecord } from "@/lib/domain/contracts";
import { deriveProjectAnalytics } from "@/lib/domain/analytics";
import { useWorkspaceStore } from "@/lib/state/workspace-store";
import { AnalystCockpit } from "@/components/app-shell/analyst-cockpit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { projectViewHref } from "@/lib/routes";

export function OverviewScreen({ project }: { project: ProjectRecord }) {
  const router = useRouter();
  const analytics = deriveProjectAnalytics(project);
  const generateArtifact = useWorkspaceStore((state) => state.generateArtifact);
  const requestClarification = useWorkspaceStore((state) => state.requestClarification);
  const artifactStatus: Array<{ label: string; ready: boolean; sections: number }> = [
    { label: "BRD", ready: Boolean(project.artifacts.find((artifact) => artifact.type === "brd")), sections: project.artifacts.find((artifact) => artifact.type === "brd")?.sections.length ?? 0 },
    { label: "PRD", ready: Boolean(project.artifacts.find((artifact) => artifact.type === "prd")), sections: project.artifacts.find((artifact) => artifact.type === "prd")?.sections.length ?? 0 },
    { label: "User Stories", ready: Boolean(project.artifacts.find((artifact) => artifact.type === "user-stories")), sections: project.artifacts.find((artifact) => artifact.type === "user-stories")?.sections.length ?? 0 },
    { label: "Acceptance Criteria", ready: Boolean(project.artifacts.find((artifact) => artifact.type === "acceptance-criteria")), sections: project.artifacts.find((artifact) => artifact.type === "acceptance-criteria")?.sections.length ?? 0 }
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-mesh px-4 py-3 md:px-5 md:py-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
          <div className="min-w-0">
            <Badge>Overview</Badge>
            <h2 className="mt-2 font-display text-xl leading-tight md:text-2xl">
              Idea to structured decisions
            </h2>
            <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-[color:var(--muted-foreground)]">
              Control room for readiness, risks, and next-best actions.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={() => router.push(projectViewHref(project.id, "canvas"))}>
                <Network className="h-4 w-4" />
                Open Canvas Board
              </Button>
              <Button variant="secondary" onClick={() => void requestClarification()}>
                <Sparkles className="h-4 w-4" />
                Run Clarification
              </Button>
              <Button variant="secondary" onClick={() => void generateArtifact("brd")}>
                <FileOutput className="h-4 w-4" />
                Generate BRD
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
            <OverviewStat label="Readiness" value={`${analytics.readinessScore}%`} detail={analytics.readinessLabel} />
            <OverviewStat label="Unknowns" value={`${project.clarificationQuestions.length}`} detail="high-impact questions" />
            <OverviewStat label="Artifacts" value={`${project.artifacts.length}`} detail="generated deliverables" />
          </div>
        </div>
      </Card>

      <AnalystCockpit project={project} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="space-y-5">
          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Badge>Quality Radar</Badge>
                <h3 className="mt-3 font-display text-[1.55rem]">Requirement integrity</h3>
              </div>
              <Badge>{project.validationWarnings.length} warnings</Badge>
            </div>
            {project.validationWarnings.length === 0 ? (
              <p className="text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                The current project model covers the critical baseline. Keep growing the board or move into documents.
              </p>
            ) : (
              <div className="grid gap-3">
                {project.validationWarnings.map((warning) => (
                  <div
                    key={warning.id}
                    className="rounded-[1.4rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--accent)]" />
                      <div>
                        <div className="font-semibold">{warning.title}</div>
                        <p className="mt-1 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                          {warning.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Badge>Structured Coverage</Badge>
                <h3 className="mt-3 font-display text-[1.55rem]">Project model signals</h3>
              </div>
              <Target className="h-5 w-5 text-[color:var(--accent)]" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <SignalCard label="Target users" value={project.model.targetUsers.length} hint="personas or actor groups" />
              <SignalCard label="Functional requirements" value={project.model.functionalRequirements.length} hint="mapped capabilities" />
              <SignalCard label="Success metrics" value={project.model.successMetrics.length} hint="measurable outcomes" />
              <SignalCard label="Open questions" value={project.model.openQuestions.length} hint="decisions still pending" />
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Badge>Artifacts</Badge>
                <h3 className="mt-3 font-display text-[1.55rem]">Document studio status</h3>
              </div>
              <Button variant="secondary" size="sm" onClick={() => router.push(projectViewHref(project.id, "artifacts"))}>
                Open Studio
              </Button>
            </div>
            <div className="grid gap-3">
              {artifactStatus.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] px-4 py-3"
                >
                  <div>
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-sm text-[color:var(--muted-foreground)]">
                      {item.ready ? `${item.sections} sections ready` : "Not generated yet"}
                    </div>
                  </div>
                  {item.ready ? <Badge>Ready</Badge> : <Badge className="bg-[color:var(--panel)] text-foreground">Pending</Badge>}
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div>
              <Badge>Fast paths</Badge>
              <h3 className="mt-3 font-display text-[1.55rem]">Primary routes</h3>
            </div>
            <div className="space-y-2">
              {[
                {
                  label: "Go back to the canvas board",
                  description: "Expand the graph, regroup ideas, and push discovery forward visually.",
                  onClick: () => router.push(projectViewHref(project.id, "canvas"))
                },
                {
                  label: "Move into backlog shaping",
                  description: "Review user stories and acceptance criteria as delivery-ready slices.",
                  onClick: () => router.push(projectViewHref(project.id, "backlog"))
                },
                {
                  label: "Open stakeholder review mode",
                  description: "Present a cleaner read-only narrative with readiness and document previews.",
                  onClick: () => router.push(projectViewHref(project.id, "presentation"))
                }
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className="flex w-full items-start justify-between gap-3 rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] px-4 py-4 text-left transition hover:border-[color:var(--accent)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50"
                >
                  <div>
                    <div className="font-semibold">{item.label}</div>
                    <div className="mt-1 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                      {item.description}
                    </div>
                  </div>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function OverviewStat({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_92%,white)] p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">{label}</div>
      <div className="mt-3 font-display text-[2rem] leading-none">{value}</div>
      <div className="mt-2 text-sm text-[color:var(--muted-foreground)]">{detail}</div>
    </div>
  );
}

function SignalCard({
  label,
  value,
  hint
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">{label}</div>
      <div className="mt-2 font-display text-[1.75rem] leading-none">{value}</div>
      <div className="mt-2 text-sm text-[color:var(--muted-foreground)]">{hint}</div>
    </div>
  );
}
