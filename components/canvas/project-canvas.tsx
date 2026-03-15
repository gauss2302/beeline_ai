"use client";

import { useMemo, useState } from "react";
import {
  Background,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlow,
  ReactFlowProvider
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Plus } from "lucide-react";
import { type ProjectRecord, projectNodeKinds } from "@/lib/domain/contracts";
import { useWorkspaceStore } from "@/lib/state/workspace-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PlanningNode } from "@/components/canvas/planning-node";

const nodeTypes = {
  planning: PlanningNode
};

export function ProjectCanvas({ project }: { project: ProjectRecord }) {
  return (
    <ReactFlowProvider>
      <CanvasSurface project={project} />
    </ReactFlowProvider>
  );
}

function CanvasSurface({ project }: { project: ProjectRecord }) {
  const [newNodeTitle, setNewNodeTitle] = useState("");
  const [newNodeType, setNewNodeType] = useState<(typeof projectNodeKinds)[number]>("feature");
  const selectedNodeId = useWorkspaceStore((state) => state.selectedNodeId);
  const selectNode = useWorkspaceStore((state) => state.selectNode);
  const createNode = useWorkspaceStore((state) => state.createNode);
  const connectNodes = useWorkspaceStore((state) => state.connectNodes);
  const updateNode = useWorkspaceStore((state) => state.updateNode);
  const generateArtifact = useWorkspaceStore((state) => state.generateArtifact);
  const syncProjectModel = useWorkspaceStore((state) => state.syncProjectModel);
  const requestClarification = useWorkspaceStore((state) => state.requestClarification);
  const expandNode = useWorkspaceStore((state) => state.expandNode);
  const setCanvasPanelTab = useWorkspaceStore((state) => state.setCanvasPanelTab);
  const setError = useWorkspaceStore((state) => state.setError);
  const selectedNode = project.nodes.find((node) => node.id === selectedNodeId) ?? null;

  const nodes = useMemo<Node[]>(
    () =>
      project.nodes.map((node) => ({
        id: node.id,
        type: "planning",
        position: { x: node.x, y: node.y },
        selected: node.id === selectedNodeId,
        data: {
          type: node.type,
          title: node.title,
          description: node.description
        }
      })),
    [project.nodes, selectedNodeId]
  );

  const edges = useMemo<Edge[]>(
    () =>
      project.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        animated: edge.label === "expands",
        style: {
          stroke: "color-mix(in oklab, var(--foreground) 50%, var(--accent))",
          strokeWidth: 1.4
        },
        labelStyle: {
          fill: "var(--muted-foreground)",
          fontSize: 11,
          fontWeight: 700
        }
      })),
    [project.edges]
  );

  async function handleAddNode() {
    const title = newNodeTitle.trim();
    if (!title) {
      useWorkspaceStore.getState().setError("Enter a title for the node.");
      return;
    }

    const parent = project.nodes.find((node) => node.id === selectedNodeId);
    await createNode(
      {
        type: newNodeType,
        title,
        description: "",
        x: (parent?.x ?? 0) + 260,
        y: (parent?.y ?? 0) + 80
      },
      { projectId: project.id }
    );
    if (!useWorkspaceStore.getState().error) {
      setNewNodeTitle("");
    }
  }

  async function handleConnect(connection: Connection) {
    if (!connection.source || !connection.target) {
      return;
    }

    await connectNodes(connection.source, connection.target, "relates");
  }

  return (
    <div className="flex min-h-[min(420px,62vh)] w-full flex-col rounded-xl border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_90%,white)] shadow-paper md:min-h-[520px] lg:min-h-[540px] lg:rounded-[2rem] [@media(min-height:600px)]:min-h-[calc(100dvh-12rem)]">
      <div className="flex shrink-0 flex-col gap-3 border-b border-[color:var(--border)] px-4 py-3 md:px-5 md:py-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 lg:flex-1">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-foreground)] md:text-sm">
              Hybrid Planning Board
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge>{project.nodes.length} nodes</Badge>
              <Badge>{project.edges.length} links</Badge>
              <Badge>{project.clarificationQuestions.length} questions</Badge>
              <Badge>{project.clarificationAnswers.length} notes</Badge>
              {selectedNode ? <Badge className="max-w-[140px] truncate">{selectedNode.title}</Badge> : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 xl:max-w-[680px] xl:justify-end">
            <Button variant="ghost" size="sm" onClick={() => setCanvasPanelTab("clarify")}>
              Gap scan
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCanvasPanelTab("model")}>
              Model panel
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void syncProjectModel()}>
              Sync model
            </Button>
            {selectedNode ? (
              <Button variant="ghost" size="sm" onClick={() => void expandNode(selectedNode.id)}>
                Expand selected
              </Button>
            ) : null}
            <select
              className="h-11 min-h-[44px] rounded-full border border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel-muted) 80%,white)] px-4 text-sm outline-none focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20 md:min-h-0"
              value={newNodeType}
              onChange={(event) => setNewNodeType(event.target.value as (typeof projectNodeKinds)[number])}
            >
              {projectNodeKinds.map((type) => (
                <option key={type} value={type}>
                  {type.replace("-", " ")}
                </option>
              ))}
            </select>
            <Input
              value={newNodeTitle}
              onChange={(event) => {
                setNewNodeTitle(event.target.value);
                setError(null);
              }}
              placeholder="Add a node to the graph"
              className="w-full sm:max-w-[260px]"
            />
            <Button type="button" variant="secondary" onClick={() => void handleAddNode()}>
              <Plus className="h-4 w-4" />
              Add Node
            </Button>
            <Button variant="secondary" onClick={() => void requestClarification()}>
              Clarify
            </Button>
          </div>
        </div>
      </div>
      <div className="paper-grid relative min-h-[min(380px,55vh)] flex-1 md:min-h-[480px] lg:min-h-[500px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onConnect={(connection) => void handleConnect(connection)}
          onNodeClick={(_, node) => selectNode(node.id)}
          onPaneClick={() => selectNode(null)}
          onNodeDragStop={(_, node) => void updateNode(node.id, { x: Math.round(node.position.x), y: Math.round(node.position.y) })}
          fitView
          proOptions={{ hideAttribution: true }}
          className="!bg-[color:color-mix(in_oklab,var(--panel)_90%,white)]"
        >
          <MiniMap
            pannable
            zoomable
            nodeColor="#d8684c"
            style={{
              background: "color-mix(in oklab, var(--panel) 85%, white)",
              borderRadius: 18,
              border: "1px solid var(--border)"
            }}
          />
          <Controls position="bottom-left" />
          <Background color="color-mix(in oklab, var(--border) 55%, transparent)" gap={22} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
