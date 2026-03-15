"use client";

import { useEffect, useState } from "react";
import { type ProjectModel, type ProjectRecord } from "@/lib/domain/contracts";
import { useWorkspaceStore } from "@/lib/state/workspace-store";
import { arrayToLines, linesToArray } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const arrayFields: Array<{
  key: keyof ProjectModel;
  label: string;
  hint: string;
}> = [
  { key: "stakeholders", label: "Stakeholders", hint: "One stakeholder per line" },
  { key: "targetUsers", label: "Target Users", hint: "One user group per line" },
  { key: "userPainPoints", label: "User Pain Points", hint: "Pain points or unmet needs" },
  { key: "scopeIn", label: "Scope In", hint: "In-scope capabilities or boundaries" },
  { key: "scopeOut", label: "Scope Out", hint: "Out-of-scope boundaries" },
  { key: "assumptions", label: "Assumptions", hint: "Working assumptions" },
  { key: "constraints", label: "Constraints", hint: "Policy, budget, time, compliance" },
  { key: "risks", label: "Risks", hint: "Business, operational, or delivery risks" },
  { key: "successMetrics", label: "Success Metrics", hint: "KPIs and success indicators" },
  { key: "functionalRequirements", label: "Functional Requirements", hint: "System capabilities and business rules" },
  { key: "nonFunctionalRequirements", label: "Non-Functional Requirements", hint: "Security, performance, auditability, reliability" },
  { key: "dependencies", label: "Dependencies", hint: "Systems, teams, approvals, external inputs" },
  { key: "openQuestions", label: "Open Questions", hint: "Outstanding decisions" }
];

export function ProjectModelEditor({ project }: { project: ProjectRecord }) {
  const updateProjectMeta = useWorkspaceStore((state) => state.updateProjectMeta);
  const syncProjectModel = useWorkspaceStore((state) => state.syncProjectModel);
  const [title, setTitle] = useState(project.title);
  const [draft, setDraft] = useState(project.model);

  useEffect(() => {
    setTitle(project.title);
    setDraft(project.model);
  }, [project]);

  async function handleSave() {
    await updateProjectMeta({
      title,
      summary: draft.summary,
      model: draft
    });
  }

  return (
    <div className="space-y-5">
      <Card className="bg-mesh">
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-start md:justify-between">
          <div className="min-w-0">
            <Badge>Canonical Model</Badge>
            <h2 className="mt-3 font-display text-xl leading-tight md:mt-4 md:text-[2rem] md:leading-none">Project requirements spine</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[color:var(--muted-foreground)] md:mt-3">
              This is the source of truth for the graph, clarification workflow, and generated artifacts.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => void syncProjectModel()}>
              Sync From Canvas
            </Button>
            <Button onClick={() => void handleSave()}>Save Model</Button>
          </div>
        </div>
      </Card>

      <Card className="min-w-0">
        <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
          <Field label="Project Title">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </Field>
          <Field label="Business Objective">
            <Textarea
              value={draft.businessObjective}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  businessObjective: event.target.value
                }))
              }
              className="min-h-[110px]"
            />
          </Field>
          <Field label="Summary">
            <Textarea
              value={draft.summary}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  summary: event.target.value
                }))
              }
            />
          </Field>
          <Field label="Problem Statement">
            <Textarea
              value={draft.problemStatement}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  problemStatement: event.target.value
                }))
              }
            />
          </Field>
        </div>
      </Card>

      <div className="grid gap-4 md:gap-5 xl:grid-cols-2">
        {arrayFields.map((field) => (
          <Card key={field.key} className="min-w-0">
            <Field label={field.label} hint={field.hint}>
              <Textarea
                value={arrayToLines(draft[field.key] as string[])}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [field.key]: linesToArray(event.target.value)
                  }))
                }
              />
            </Field>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
          {label}
        </span>
        {hint ? <span className="text-xs text-[color:var(--muted-foreground)]">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}
