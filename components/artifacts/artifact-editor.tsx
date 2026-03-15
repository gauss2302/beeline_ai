"use client";

import { useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { FileOutput, RefreshCcw, Save } from "lucide-react";
import { type ArtifactKind, type ProjectRecord } from "@/lib/domain/contracts";
import { useWorkspaceStore } from "@/lib/state/workspace-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const artifactTypes: ArtifactKind[] = ["brd", "prd", "user-stories", "acceptance-criteria"];

export function ArtifactEditor({ project }: { project: ProjectRecord }) {
  const activeArtifactType = useWorkspaceStore((state) => state.activeArtifactType);
  const selectArtifactType = useWorkspaceStore((state) => state.selectArtifactType);
  const selectedSectionId = useWorkspaceStore((state) => state.selectedSectionId);
  const selectSection = useWorkspaceStore((state) => state.selectSection);
  const generateArtifact = useWorkspaceStore((state) => state.generateArtifact);
  const updateArtifactSection = useWorkspaceStore((state) => state.updateArtifactSection);
  const regenerateArtifactSection = useWorkspaceStore((state) => state.regenerateArtifactSection);
  const artifact = project.artifacts.find((item) => item.type === activeArtifactType);
  const selectedSection =
    artifact?.sections.find((section) => section.id === selectedSectionId) ?? artifact?.sections[0] ?? null;

  const editor = useEditor(
    {
      extensions: [StarterKit],
      content: selectedSection?.content ?? "<p>Select a section to begin editing.</p>",
      immediatelyRender: false
    },
    [selectedSection?.id, selectedSection?.updatedAt]
  );

  const totalSections = artifact?.sections.length ?? 0;

  const sourceTrace = useMemo(
    () =>
      selectedSection
        ? {
            fields: selectedSection.sourceFields,
            nodeIds: selectedSection.sourceNodeIds
          }
        : null,
    [selectedSection]
  );

  return (
    <div className="space-y-5">
      <Card className="bg-mesh">
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-start md:justify-between">
          <div className="min-w-0">
            <Badge>Structured Artifacts</Badge>
            <h2 className="mt-3 font-display text-xl leading-tight md:mt-4 md:text-[2rem] md:leading-none">Document workspace</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[color:var(--muted-foreground)] md:mt-3">
              Generate BRDs, PRDs, user stories, and acceptance criteria from the canonical project model, then refine sections without rerunning the entire document.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {artifactTypes.map((type) => (
              <Button
                key={type}
                variant={type === activeArtifactType ? "default" : "secondary"}
                size="sm"
                onClick={() => {
                  selectArtifactType(type);
                  if (!project.artifacts.find((item) => item.type === type)) {
                    void generateArtifact(type);
                  }
                }}
              >
                {labelForArtifact(type)}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {!artifact ? (
        <Card className="flex min-h-[min(360px,55vh)] flex-col items-center justify-center gap-4 px-4 py-8 text-center md:min-h-[480px]">
          <FileOutput className="h-10 w-10 text-[color:var(--accent)] md:h-12 md:w-12" aria-hidden />
          <div>
            <h3 className="font-display text-xl md:text-[1.55rem]">No {labelForArtifact(activeArtifactType)} yet</h3>
            <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
              Generate the first draft from the current graph and project model.
            </p>
          </div>
          <Button onClick={() => void generateArtifact(activeArtifactType)}>Generate Draft</Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:gap-5 xl:grid-cols-[minmax(300px,320px)_minmax(0,1fr)]">
          <Card className="min-w-0 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                  Sections
                </div>
                <h3 className="mt-2 font-display text-[1.4rem]">{artifact.title}</h3>
              </div>
              <Badge>{totalSections} sections</Badge>
            </div>
            <div className="space-y-2">
              {artifact.sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => selectSection(section.id)}
                  className={cn(
                    "w-full min-h-[44px] rounded-[1.35rem] border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/50 md:min-h-0",
                    selectedSection?.id === section.id
                      ? "border-[color:var(--accent)] bg-[color:color-mix(in_oklab,var(--accent-soft) 40%,white)]"
                      : "border-[color:var(--border)] bg-[color:var(--panel-muted)] hover:border-[color:var(--accent)]"
                  )}
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                    {section.key}
                  </div>
                  <div className="mt-2 font-medium">{section.title}</div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Badge>{selectedSection?.title ?? "Section"}</Badge>
                <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">{artifact.summary}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSection ? (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => void regenerateArtifactSection(artifact.id, selectedSection.id)}
                    >
                      <RefreshCcw className="h-4 w-4" />
                      Regenerate Section
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!editor || !selectedSection) {
                          return;
                        }
                        void updateArtifactSection(artifact.id, selectedSection.id, editor.getHTML());
                      }}
                    >
                      <Save className="h-4 w-4" />
                      Save Section
                    </Button>
                  </>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(260px,300px)]">
              <div className="min-w-0 rounded-[1.6rem] border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel) 88%,white)] p-5">
                <EditorContent editor={editor} />
              </div>
              <div className="min-w-0 space-y-4">
                <Card className="bg-[color:var(--panel-muted)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                    Traceability
                  </div>
                  <div className="mt-4 space-y-4 text-sm">
                    <div>
                      <div className="font-semibold">Source fields</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {sourceTrace?.fields.length ? (
                          sourceTrace.fields.map((field) => <Badge key={field}>{field}</Badge>)
                        ) : (
                          <span className="text-[color:var(--muted-foreground)]">No mapped fields</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold">Source nodes</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {sourceTrace?.nodeIds.length ? (
                          sourceTrace.nodeIds.map((nodeId) => <Badge key={nodeId}>{nodeId}</Badge>)
                        ) : (
                          <span className="text-[color:var(--muted-foreground)]">No mapped nodes</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function labelForArtifact(type: ArtifactKind) {
  switch (type) {
    case "brd":
      return "BRD";
    case "prd":
      return "PRD";
    case "user-stories":
      return "User Stories";
    case "acceptance-criteria":
      return "Acceptance Criteria";
  }
}
