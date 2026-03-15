"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileJson2, MessageSquareQuote, PanelRightClose, ScanSearch, Sparkles, X } from "lucide-react";
import { type ProjectModel, type ProjectNodeKind, type ProjectRecord, projectNodeKinds } from "@/lib/domain/contracts";
import { useWorkspaceStore } from "@/lib/state/workspace-store";
import { arrayToLines, linesToArray, relativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const compactArrayFields: Array<{
  key: keyof ProjectModel;
  label: string;
  hint: string;
}> = [
  { key: "stakeholders", label: "Stakeholders", hint: "one per line" },
  { key: "targetUsers", label: "Target users", hint: "roles or personas" },
  { key: "scopeIn", label: "Scope in", hint: "included capabilities" },
  { key: "scopeOut", label: "Scope out", hint: "explicit exclusions" },
  { key: "functionalRequirements", label: "Functional requirements", hint: "capabilities and rules" },
  { key: "successMetrics", label: "Success metrics", hint: "measurable outcomes" },
  { key: "risks", label: "Risks", hint: "delivery or business risks" },
  { key: "openQuestions", label: "Open questions", hint: "what still blocks confidence" }
];

export function CanvasSidePanel({ project }: { project: ProjectRecord }) {
  const open = useWorkspaceStore((state) => state.canvasPanelOpen);
  const tab = useWorkspaceStore((state) => state.canvasPanelTab);
  const setCanvasPanelTab = useWorkspaceStore((state) => state.setCanvasPanelTab);
  const toggleCanvasPanel = useWorkspaceStore((state) => state.toggleCanvasPanel);

  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; startTop: number; startRight: number } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const currentTop = position?.top ?? rect.top;
      const currentRight = typeof window !== "undefined" ? window.innerWidth - rect.right : rect.right;
      dragRef.current = { startX: e.clientX, startY: e.clientY, startTop: currentTop, startRight: currentRight };
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [position]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const newRight = Math.max(8, Math.min(typeof window !== "undefined" ? window.innerWidth - 80 : 400, dragRef.current.startRight - dx));
    const newTop = Math.max(8, Math.min(typeof window !== "undefined" ? window.innerHeight - 200 : 400, dragRef.current.startTop + dy));
    setPosition({ top: newTop, right: newRight });
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (dragRef.current) (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    dragRef.current = null;
  }, []);

  const tabs = [
    { id: "node", label: "Node", icon: ScanSearch },
    { id: "clarify", label: "Clarify", icon: MessageSquareQuote },
    { id: "model", label: "Model", icon: FileJson2 }
  ] as const;

  const wrapperStyle = position
    ? { top: position.top, right: position.right, left: "auto", bottom: "auto" }
    : undefined;

  return (
    <div
      className="pointer-events-none absolute top-4 right-4 z-30 flex items-start gap-3"
      style={wrapperStyle}
    >
      <div
        role="group"
        aria-label="Canvas panel tabs"
        className="pointer-events-auto mt-2 flex cursor-grab active:cursor-grabbing flex-col gap-2 rounded-[1.5rem] border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel) 94%,white)] p-2 shadow-paper touch-none select-none"
        style={position ? { marginTop: 0 } : undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCanvasPanelTab(item.id)}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-[1rem] border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50",
                open && active
                  ? "border-[color:var(--accent)] bg-[color:color-mix(in_oklab,var(--accent-soft) 48%,white)] text-foreground"
                  : "border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_92%,white)] text-[color:var(--muted-foreground)] hover:border-[color:var(--accent)] hover:text-foreground"
              )}
              aria-label={item.label}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => toggleCanvasPanel(false)}
          className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_92%,white)] text-[color:var(--muted-foreground)] transition hover:border-[color:var(--accent)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50"
          aria-label="Collapse panel"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
      </div>

      <aside
        className={cn(
          "pointer-events-auto flex h-full max-h-[calc(100dvh-6rem)] w-[380px] max-w-[calc(100vw-9rem)] shrink-0 flex-col transition duration-300",
          open ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-[110%] opacity-0"
        )}
      >
        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2rem] bg-[color:var(--panel)] p-0">
          <div className="flex items-center justify-between border-b border-[color:var(--border)] px-5 py-4">
            <div>
              <Badge>{tab === "node" ? "Node details" : tab === "clarify" ? "Clarification flow" : "Canonical model"}</Badge>
              <div className="mt-2 font-display text-[1.55rem]">
                {tab === "node" ? "Context panel" : tab === "clarify" ? "Discovery questions" : "Project model"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleCanvasPanel(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_92%,white)] transition hover:border-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50"
              aria-label="Close panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {tab === "node" ? <NodePanel project={project} /> : null}
            {tab === "clarify" ? <ClarificationTab project={project} /> : null}
            {tab === "model" ? <ProjectModelPanel project={project} /> : null}
          </div>
        </Card>
      </aside>
    </div>
  );
}

function NodePanel({ project }: { project: ProjectRecord }) {
  const nodeId = useWorkspaceStore((state) => state.selectedNodeId);
  const updateNode = useWorkspaceStore((state) => state.updateNode);
  const deleteNode = useWorkspaceStore((state) => state.deleteNode);
  const expandNode = useWorkspaceStore((state) => state.expandNode);
  const generateArtifact = useWorkspaceStore((state) => state.generateArtifact);
  const selectedNode = useMemo(() => project.nodes.find((item) => item.id === nodeId) ?? null, [project.nodes, nodeId]);
  const [draft, setDraft] = useState(selectedNode);

  useEffect(() => {
    setDraft(selectedNode);
  }, [selectedNode]);

  if (!draft) {
    return (
      <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-4">
        <Badge>Select a node</Badge>
        <h3 className="mt-3 font-display text-[1.5rem]">Start from the board</h3>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
          Pick a node on the canvas to edit its meaning, expand it with AI, or turn it into backlog artifacts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-4">
        <Badge>{draft.type.replace("-", " ")}</Badge>
        <h3 className="mt-3 font-display text-[1.55rem] leading-tight">{draft.title}</h3>
        <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
          Node-level editing keeps the graph and the structured model in sync.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
          Type
        </span>
        <select
          value={draft.type}
          onChange={(event) => setDraft((current) => (current ? { ...current, type: event.target.value as ProjectNodeKind } : current))}
          className="h-11 w-full rounded-2xl border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_88%,white)] px-4 text-sm outline-none focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20"
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
        <Input value={draft.title} onChange={(event) => setDraft((current) => (current ? { ...current, title: event.target.value } : current))} />
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
          Description
        </span>
        <Textarea
          value={draft.description}
          onChange={(event) => setDraft((current) => (current ? { ...current, description: event.target.value } : current))}
          className="min-h-[120px]"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
          Details
        </span>
        <Textarea
          value={draft.details ?? ""}
          onChange={(event) => setDraft((current) => (current ? { ...current, details: event.target.value } : current))}
          className="min-h-[140px]"
        />
      </label>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            void updateNode(draft.id, {
              type: draft.type,
              title: draft.title,
              description: draft.description,
              details: draft.details
            })
          }
        >
          Save Node
        </Button>
        <Button size="sm" onClick={() => void expandNode(draft.id)}>
          <Sparkles className="h-4 w-4" />
          Expand Node
        </Button>
        <Button variant="secondary" size="sm" onClick={() => void generateArtifact("user-stories")}>
          Generate Stories
        </Button>
        <Button variant="secondary" size="sm" onClick={() => void generateArtifact("acceptance-criteria")}>
          Acceptance Criteria
        </Button>
      </div>

      <Button variant="ghost" size="sm" onClick={() => void deleteNode(draft.id)}>
        Delete Node
      </Button>
    </div>
  );
}

function ClarificationTab({ project }: { project: ProjectRecord }) {
  const submitClarificationAnswer = useWorkspaceStore((state) => state.submitClarificationAnswer);
  const requestClarification = useWorkspaceStore((state) => state.requestClarification);
  const [questionDrafts, setQuestionDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    setQuestionDrafts({});
  }, [project.id, project.clarificationQuestions.length]);

  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Badge>{project.clarificationQuestions.length} open</Badge>
            <h3 className="mt-3 font-display text-[1.55rem]">Targeted unknowns</h3>
          </div>
          <Button variant="secondary" size="sm" onClick={() => void requestClarification()}>
            Refresh
          </Button>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
          The system asks only for missing information that materially improves the model and downstream documents.
        </p>
      </div>

      {project.clarificationQuestions.length === 0 ? (
        <Card className="bg-[color:var(--panel-muted)]">
          <p className="text-sm leading-relaxed text-[color:var(--muted-foreground)]">
            No open clarification questions right now. The board is ready for further expansion or documentation.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {project.clarificationQuestions.map((question) => (
            <div
              key={question.id}
              className="rounded-[1.45rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <Badge>{question.priority}</Badge>
                <Badge>{question.field}</Badge>
              </div>
              <div className="mt-3 font-medium leading-relaxed">{question.prompt}</div>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{question.rationale}</p>
              <Textarea
                value={questionDrafts[question.id] ?? ""}
                onChange={(event) =>
                  setQuestionDrafts((current) => ({
                    ...current,
                    [question.id]: event.target.value
                  }))
                }
                placeholder="Add the missing business context..."
                className="mt-3 min-h-[110px]"
              />
              <Button
                size="sm"
                className="mt-3"
                onClick={async () => {
                  const applied = await submitClarificationAnswer(question.id, questionDrafts[question.id] ?? "");
                  if (applied) {
                    setQuestionDrafts((current) => ({
                      ...current,
                      [question.id]: ""
                    }));
                  }
                }}
              >
                Apply Answer
              </Button>
            </div>
          ))}
        </div>
      )}

      {project.clarificationAnswers.length > 0 ? (
        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Badge>{project.clarificationAnswers.length} applied</Badge>
                <h3 className="mt-3 font-display text-[1.55rem]">Comment trail</h3>
              </div>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
              Every accepted clarification is stored as a note, persisted in Postgres, and linked back into the graph.
            </p>
          </div>

          <div className="space-y-3">
            {[...project.clarificationAnswers]
              .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt))
              .slice(0, 6)
              .map((answer) => (
                <div
                  key={`${answer.questionId}-${answer.submittedAt}`}
                  className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_92%,white)] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Badge>{(answer.field ?? "note").replace(/([A-Z])/g, " $1").toLowerCase()}</Badge>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                      {relativeTime(answer.submittedAt)}
                    </span>
                  </div>
                  {answer.prompt ? (
                    <div className="mt-3 text-sm font-medium leading-relaxed">{answer.prompt}</div>
                  ) : null}
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--foreground)]">{answer.answer}</p>
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProjectModelPanel({ project }: { project: ProjectRecord }) {
  const updateProjectMeta = useWorkspaceStore((state) => state.updateProjectMeta);
  const syncProjectModel = useWorkspaceStore((state) => state.syncProjectModel);
  const [title, setTitle] = useState(project.title);
  const [draft, setDraft] = useState(project.model);

  useEffect(() => {
    setTitle(project.title);
    setDraft(project.model);
  }, [project]);

  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Badge>Shared source of truth</Badge>
            <h3 className="mt-3 font-display text-[1.55rem]">Structured project model</h3>
          </div>
          <Button variant="secondary" size="sm" onClick={() => void syncProjectModel()}>
            Sync
          </Button>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
          Edit the canonical fields without leaving the board. This panel never shifts the canvas itself.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
          Project title
        </span>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
          Summary
        </span>
        <Textarea
          value={draft.summary}
          onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))}
          className="min-h-[110px]"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
          Problem statement
        </span>
        <Textarea
          value={draft.problemStatement}
          onChange={(event) => setDraft((current) => ({ ...current, problemStatement: event.target.value }))}
          className="min-h-[110px]"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
          Business objective
        </span>
        <Textarea
          value={draft.businessObjective}
          onChange={(event) => setDraft((current) => ({ ...current, businessObjective: event.target.value }))}
          className="min-h-[110px]"
        />
      </label>

      {compactArrayFields.map((field) => (
        <label key={field.key} className="block space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
              {field.label}
            </span>
            <span className="text-[11px] text-[color:var(--muted-foreground)]">{field.hint}</span>
          </div>
          <Textarea
            value={arrayToLines(draft[field.key] as string[])}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                [field.key]: linesToArray(event.target.value)
              }))
            }
            className="min-h-[96px]"
          />
        </label>
      ))}

      <Button
        className="w-full"
        onClick={() =>
          void updateProjectMeta({
            title,
            summary: draft.summary,
            model: draft
          })
        }
      >
        Save Project Model
      </Button>
    </div>
  );
}
