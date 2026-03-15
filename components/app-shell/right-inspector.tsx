"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, GitBranchPlus, ListChecks, Sparkles, Trash2 } from "lucide-react";
import { projectNodeKinds, type ProjectRecord } from "@/lib/domain/contracts";
import { getActiveProject, useWorkspaceStore } from "@/lib/state/workspace-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function RightInspector() {
  const state = useWorkspaceStore();
  const project = getActiveProject(state);
  const [questionDrafts, setQuestionDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    setQuestionDrafts({});
  }, [project?.id]);

  if (!project) {
    return (
      <aside className="border-t border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel) 92%,white)] p-4 md:p-5 lg:border-l lg:border-t-0">
        <Card className="bg-[color:var(--panel-muted)]">
          <h2 className="font-display text-[1.5rem]">Analyst panel</h2>
          <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
            Create a project to inspect nodes, answer clarification questions, and monitor requirement quality.
          </p>
        </Card>
      </aside>
    );
  }

  const selectedNode = project.nodes.find((node) => node.id === state.selectedNodeId) ?? null;
  const activeArtifact = project.artifacts.find((artifact) => artifact.type === state.activeArtifactType);
  const selectedSection =
    activeArtifact?.sections.find((section) => section.id === state.selectedSectionId) ?? null;

  return (
    <aside className="h-full space-y-4 overflow-y-auto border-t border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel) 92%,white)] p-4 md:space-y-5 md:p-5 lg:border-l lg:border-t-0">
      {state.view === "artifacts" && selectedSection ? (
        <ArtifactInspector project={project} />
      ) : (
        <>
          <NodeInspector project={project} nodeId={selectedNode?.id ?? null} />
          <QualityPanel project={project} />
          <ClarificationPanel
            project={project}
            questionDrafts={questionDrafts}
            onChange={(questionId, value) =>
              setQuestionDrafts((current) => ({
                ...current,
                [questionId]: value
              }))
            }
          />
        </>
      )}
    </aside>
  );
}

function NodeInspector({ project, nodeId }: { project: ProjectRecord; nodeId: string | null }) {
  const node = useMemo(() => project.nodes.find((item) => item.id === nodeId) ?? null, [project.nodes, nodeId]);
  const updateNode = useWorkspaceStore((state) => state.updateNode);
  const deleteNode = useWorkspaceStore((state) => state.deleteNode);
  const expandNode = useWorkspaceStore((state) => state.expandNode);
  const generateArtifact = useWorkspaceStore((state) => state.generateArtifact);
  const requestClarification = useWorkspaceStore((state) => state.requestClarification);
  const [draft, setDraft] = useState(node);

  useEffect(() => {
    setDraft(node);
  }, [node]);

  if (!draft) {
    return (
      <Card className="bg-[color:var(--panel-muted)]">
        <Badge>Inspector</Badge>
        <h2 className="mt-4 font-display text-[1.6rem]">Select a graph node</h2>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
          Edit node metadata here, then trigger AI expansion or convert a refined feature into documents.
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Badge>{draft.type.replace("-", " ")}</Badge>
          <h2 className="mt-3 font-display text-[1.6rem] leading-tight">{draft.title}</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void deleteNode(draft.id)}
          className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
          aria-label="Delete node"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
          Type
        </span>
        <select
          value={draft.type}
          onChange={(event) =>
            setDraft((current) => (current ? { ...current, type: event.target.value as typeof current.type } : current))
          }
          className="h-11 min-h-[44px] w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel-muted)] px-4 text-sm outline-none focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20"
        >
          {projectNodeKinds.map((type) => (
            <option key={type} value={type}>
              {type.replace("-", " ")}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
          Title
        </span>
        <Input
          value={draft.title}
          onChange={(event) =>
            setDraft((current) => (current ? { ...current, title: event.target.value } : current))
          }
        />
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
          Description
        </span>
        <Textarea
          value={draft.description}
          onChange={(event) =>
            setDraft((current) => (current ? { ...current, description: event.target.value } : current))
          }
        />
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
          Details
        </span>
        <Textarea
          value={draft.details ?? ""}
          onChange={(event) =>
            setDraft((current) => (current ? { ...current, details: event.target.value } : current))
          }
          className="min-h-[110px]"
        />
      </label>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => void updateNode(draft.id, { type: draft.type, title: draft.title, description: draft.description, details: draft.details })}
        >
          Save Node
        </Button>
        <Button size="sm" onClick={() => void expandNode(draft.id)}>
          <GitBranchPlus className="h-4 w-4" />
          Expand Node
        </Button>
        <Button variant="secondary" size="sm" onClick={() => void generateArtifact("user-stories")}>
          <ListChecks className="h-4 w-4" />
          User Stories
        </Button>
        <Button variant="secondary" size="sm" onClick={() => void generateArtifact("acceptance-criteria")}>
          <Sparkles className="h-4 w-4" />
          Acceptance Criteria
        </Button>
      </div>

      <Button variant="ghost" size="sm" onClick={() => void requestClarification()}>
        Refresh clarification questions
      </Button>
    </Card>
  );
}

function QualityPanel({ project }: { project: ProjectRecord }) {
  return (
    <Card className="space-y-4 bg-[color:var(--panel-muted)]">
      <div className="flex items-center justify-between">
        <div>
          <Badge>Quality checks</Badge>
          <h2 className="mt-3 font-display text-[1.4rem]">Requirement integrity</h2>
        </div>
        <Badge>{project.validationWarnings.length} warnings</Badge>
      </div>
      {project.validationWarnings.length === 0 ? (
        <p className="text-sm text-[color:var(--muted-foreground)]">
          No active warnings. The project model currently covers the critical discovery baseline.
        </p>
      ) : (
        <div className="space-y-3">
          {project.validationWarnings.map((warning) => (
            <div
              key={warning.id}
              className="rounded-[1.3rem] border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_88%,white)] p-4"
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle className="h-4 w-4 text-[color:var(--accent)]" />
                {warning.title}
              </div>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{warning.message}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ClarificationPanel({
  project,
  questionDrafts,
  onChange
}: {
  project: ProjectRecord;
  questionDrafts: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
}) {
  const submitClarificationAnswer = useWorkspaceStore((state) => state.submitClarificationAnswer);

  return (
    <Card className="space-y-4">
      <div>
        <Badge>Clarification flow</Badge>
        <h2 className="mt-3 font-display text-[1.4rem]">High-impact unknowns</h2>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
          The AI planner only asks for missing information that materially improves the project model.
        </p>
      </div>
      <div className="space-y-4">
        {project.clarificationQuestions.length === 0 ? (
          <div className="rounded-[1.3rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-4 text-sm text-[color:var(--muted-foreground)]">
            No open clarification questions right now.
          </div>
        ) : (
          project.clarificationQuestions.map((question) => (
            <div
              key={question.id}
              className="rounded-[1.4rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <Badge>{question.priority}</Badge>
                <Badge>{question.field}</Badge>
              </div>
              <div className="mt-3 font-medium leading-relaxed">{question.prompt}</div>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{question.rationale}</p>
              <Textarea
                value={questionDrafts[question.id] ?? ""}
                onChange={(event) => onChange(question.id, event.target.value)}
                placeholder="Add the missing business context..."
                className="mt-3 min-h-[100px]"
              />
              <Button
                size="sm"
                className="mt-3"
                onClick={() => void submitClarificationAnswer(question.id, questionDrafts[question.id] ?? "")}
              >
                Apply Answer
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function ArtifactInspector({ project }: { project: ProjectRecord }) {
  const state = useWorkspaceStore();
  const artifact = project.artifacts.find((item) => item.type === state.activeArtifactType);
  const section = artifact?.sections.find((item) => item.id === state.selectedSectionId) ?? artifact?.sections[0];

  return (
    <Card className="space-y-4">
      <Badge>Artifact trace</Badge>
      <h2 className="font-display text-[1.5rem]">{section?.title ?? "Select a section"}</h2>
      <p className="text-sm text-[color:var(--muted-foreground)]">
        Each document section retains a direct mapping back to project fields and graph nodes.
      </p>
      <div className="space-y-3">
        <div className="rounded-[1.3rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
            Source fields
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {section?.sourceFields.length ? (
              section.sourceFields.map((field) => <Badge key={field}>{field}</Badge>)
            ) : (
              <span className="text-sm text-[color:var(--muted-foreground)]">No mapped fields</span>
            )}
          </div>
        </div>
        <div className="rounded-[1.3rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
            Source nodes
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {section?.sourceNodeIds.length ? (
              section.sourceNodeIds.map((nodeId) => <Badge key={nodeId}>{nodeId}</Badge>)
            ) : (
              <span className="text-sm text-[color:var(--muted-foreground)]">No mapped nodes</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
