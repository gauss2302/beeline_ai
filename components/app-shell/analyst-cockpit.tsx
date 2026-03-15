"use client";

import { ArrowRight, FileCheck2, Lightbulb, Radar, ShieldAlert, Sparkles } from "lucide-react";
import { type ProjectRecord } from "@/lib/domain/contracts";
import { deriveProjectAnalytics } from "@/lib/domain/analytics";
import { useWorkspaceStore } from "@/lib/state/workspace-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AnalystCockpit({ project }: { project: ProjectRecord }) {
  const analytics = deriveProjectAnalytics(project);
  const selectedNodeId = useWorkspaceStore((state) => state.selectedNodeId);
  const requestClarification = useWorkspaceStore((state) => state.requestClarification);
  const syncProjectModel = useWorkspaceStore((state) => state.syncProjectModel);
  const generateArtifact = useWorkspaceStore((state) => state.generateArtifact);
  const expandNode = useWorkspaceStore((state) => state.expandNode);

  async function runAction(action: (typeof analytics.nextActions)[number]["action"]) {
    switch (action) {
      case "clarify":
        await requestClarification();
        break;
      case "sync":
        await syncProjectModel();
        break;
      case "generate-brd":
        await generateArtifact("brd");
        break;
      case "generate-prd":
        await generateArtifact("prd");
        break;
      case "generate-stories":
        await generateArtifact("user-stories");
        break;
      case "expand-selected":
        if (selectedNodeId) {
          await expandNode(selectedNodeId);
        }
        break;
    }
  }

  return (
    <Card className="relative overflow-hidden bg-mesh">
      <div className="absolute inset-y-0 right-[-12%] w-[36%] rounded-full bg-[color:color-mix(in_oklab,var(--accent-soft) 44%,transparent)] blur-3xl" aria-hidden />
      <div className="relative space-y-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Analyst cockpit</Badge>
              <Badge className="border-[color:var(--border)] bg-[color:var(--panel)] text-foreground">{analytics.readinessScore}%</Badge>
              <Badge className="border-[color:var(--border)] bg-[color:var(--panel)] text-foreground">{analytics.readinessLabel}</Badge>
            </div>
            <h2 className="mt-2 font-display text-lg leading-tight md:text-xl">
              Discovery pulse
            </h2>
            <p className="mt-1 max-w-4xl text-sm leading-relaxed text-[color:var(--muted-foreground)]">
              Next-best actions and document readiness from the project graph.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="default" size="sm" onClick={() => void requestClarification()}>
              Run clarification
            </Button>
            <Button variant="secondary" size="sm" onClick={() => void syncProjectModel()}>
              Sync model
            </Button>
            <Button variant="secondary" size="sm" onClick={() => void generateArtifact("brd")}>
              BRD
            </Button>
            <Button variant="secondary" size="sm" onClick={() => void generateArtifact("prd")}>
              PRD
            </Button>
          </div>
        </div>

        <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] 2xl:grid-cols-[minmax(0,1.16fr)_minmax(360px,0.9fr)]">
          <div className="grid min-w-0 self-start gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            <MetricCard icon={<Radar className="h-5 w-5" />} label="Planning graph" value={`${analytics.nodeCount} nodes`} detail={`${analytics.featureCount} active features`} />
            <MetricCard icon={<ShieldAlert className="h-5 w-5" />} label="Risk pulse" value={`${analytics.riskCount} mapped risks`} detail={`${analytics.questionCount} open questions`} />
            <MetricCard icon={<FileCheck2 className="h-5 w-5" />} label="Doc coverage" value={`${analytics.artifactCoverage}%`} detail={`${project.artifacts.length} generated artifacts`} />
            <MetricCard icon={<Lightbulb className="h-5 w-5" />} label="Focus areas" value={`${analytics.focusAreas.length}`} detail="priority refinement lanes" />
          </div>

          <div className="grid min-w-0 self-start gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="min-w-0 rounded-[1.4rem] border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_92%,white)] p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                <Sparkles className="h-4 w-4 text-[color:var(--accent)]" />
                Coverage pillars
              </div>
              <div className="mt-3 space-y-2.5">
                {analytics.pillars.map((pillar) => (
                  <div key={pillar.id}>
                    <div className="flex items-center justify-between gap-3 text-xs font-medium uppercase tracking-[0.14em]">
                      <span>{pillar.label}</span>
                      <span className="text-[color:var(--muted-foreground)]">
                        {pillar.value}/{pillar.max}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-[color:var(--panel-muted)]">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          pillar.tone === "healthy"
                            ? "bg-[color:oklch(0.7_0.12_145)]"
                            : pillar.tone === "watch"
                              ? "bg-[color:oklch(0.77_0.14_70)]"
                              : "bg-[color:oklch(0.69_0.18_28)]"
                        )}
                        style={{ width: `${(pillar.value / pillar.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="min-w-0 rounded-[1.4rem] border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_92%,white)] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                Next best moves
              </div>
              <div className="mt-3 grid gap-2">
                {analytics.nextActions.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => void runAction(item.action)}
                    className="group flex min-h-[44px] w-full items-start justify-between gap-3 rounded-[1.1rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] px-3 py-2.5 text-left transition hover:border-[color:var(--accent)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50 md:min-h-0"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="mt-1 text-xs text-[color:var(--muted-foreground)]">{item.description}</div>
                    </div>
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 transition group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {analytics.focusAreas.length > 0 ? (
                  analytics.focusAreas.slice(0, 3).map((item) => <Badge key={item}>{item}</Badge>)
                ) : (
                  <Badge className="bg-[color:oklch(0.88_0.05_145)] text-foreground">Core discovery baseline is covered</Badge>
                )}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[color:var(--muted-foreground)]">
                Selected node: <span className="font-semibold text-foreground">{selectedNodeId ?? "none"}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="min-w-0 rounded-[1.5rem] border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_92%,white)] p-3 shadow-paper md:p-4">
      <div className="flex items-center gap-2 text-[color:var(--accent)]">{icon}</div>
      <div className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)] md:mt-4">
        {label}
      </div>
      <div className="mt-1.5 font-display text-xl leading-none md:mt-2 md:text-[1.7rem]">{value}</div>
      <div className="mt-1.5 text-xs text-[color:var(--muted-foreground)] md:mt-2 md:text-sm">{detail}</div>
    </div>
  );
}
