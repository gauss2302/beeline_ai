import { relations, sql } from "drizzle-orm";
import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar
} from "drizzle-orm/pg-core";

const id = (name: string) => varchar(name, { length: 128 });

const vector = customType<{
  data: number[] | null;
  driverData: string | null;
  config: { dimensions: number };
}>({
  dataType(config) {
    return `vector(${config?.dimensions ?? 1536})`;
  },
  toDriver(value) {
    return value ? `[${value.join(",")}]` : null;
  },
  fromDriver(value) {
    if (!value) {
      return null;
    }

    return value
      .slice(1, -1)
      .split(",")
      .map((entry) => Number(entry));
  }
});

export const projectNodeTypeEnum = pgEnum("project_node_type", [
  "idea",
  "problem",
  "user",
  "stakeholder",
  "goal",
  "feature",
  "requirement",
  "constraint",
  "risk",
  "metric",
  "assumption",
  "open-question"
]);

export const artifactTypeEnum = pgEnum("artifact_type", ["brd", "prd", "user-stories", "acceptance-criteria"]);
export const artifactStatusEnum = pgEnum("artifact_status", ["draft", "published"]);
export const generationStatusEnum = pgEnum("generation_status", ["queued", "running", "succeeded", "failed"]);

export const users = pgTable("users", {
  id: id("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const workspaces = pgTable("workspaces", {
  id: id("id").primaryKey(),
  ownerId: id("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const projects = pgTable(
  "projects",
  {
    id: id("id").primaryKey(),
    workspaceId: id("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    idea: text("idea").notNull(),
    summary: text("summary").notNull().default(""),
    canonicalModel: jsonb("canonical_model").$type<Record<string, unknown>>().notNull(),
    analysisState: jsonb("analysis_state").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    workspaceIdx: index("projects_workspace_idx").on(table.workspaceId)
  })
);

export const projectNodes = pgTable(
  "project_nodes",
  {
    id: id("id").primaryKey(),
    projectId: id("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    type: projectNodeTypeEnum("type").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull().default(""),
    details: text("details"),
    tags: jsonb("tags").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    sourceField: varchar("source_field", { length: 64 }),
    positionX: integer("position_x").notNull().default(0),
    positionY: integer("position_y").notNull().default(0),
    embedding: vector("embedding", { dimensions: 1536 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    projectIdx: index("project_nodes_project_idx").on(table.projectId),
    embeddingIdx: index("project_nodes_embedding_idx").using("hnsw", table.embedding.op("vector_cosine_ops"))
  })
);

export const projectEdges = pgTable(
  "project_edges",
  {
    id: id("id").primaryKey(),
    projectId: id("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    sourceNodeId: id("source_node_id")
      .notNull()
      .references(() => projectNodes.id, { onDelete: "cascade" }),
    targetNodeId: id("target_node_id")
      .notNull()
      .references(() => projectNodes.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 120 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    projectIdx: index("project_edges_project_idx").on(table.projectId)
  })
);

export const projectModelSnapshots = pgTable("project_model_snapshots", {
  id: id("id").primaryKey(),
  projectId: id("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  source: varchar("source", { length: 80 }).notNull(),
  model: jsonb("model").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const clarificationRounds = pgTable("clarification_rounds", {
  id: id("id").primaryKey(),
  projectId: id("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  status: generationStatusEnum("status").notNull().default("queued"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true })
});

export const clarificationAnswers = pgTable("clarification_answers", {
  id: id("id").primaryKey(),
  roundId: id("round_id")
    .notNull()
    .references(() => clarificationRounds.id, { onDelete: "cascade" }),
  questionId: varchar("question_id", { length: 128 }).notNull(),
  field: varchar("field", { length: 64 }).notNull(),
  prompt: text("prompt").notNull(),
  answer: text("answer").notNull(),
  sourceNodeIds: jsonb("source_node_ids").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const artifacts = pgTable("artifacts", {
  id: id("id").primaryKey(),
  projectId: id("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  type: artifactTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary").notNull().default(""),
  status: artifactStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const artifactSections = pgTable(
  "artifact_sections",
  {
    id: id("id").primaryKey(),
    artifactId: id("artifact_id")
      .notNull()
      .references(() => artifacts.id, { onDelete: "cascade" }),
    sectionKey: varchar("section_key", { length: 120 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    content: text("content").notNull().default(""),
    sourceFields: jsonb("source_fields").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    sourceNodeIds: jsonb("source_node_ids").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    artifactIdx: index("artifact_sections_artifact_idx").on(table.artifactId)
  })
);

export const artifactVersions = pgTable("artifact_versions", {
  id: id("id").primaryKey(),
  artifactId: id("artifact_id")
    .notNull()
    .references(() => artifacts.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  content: jsonb("content").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const aiGenerations = pgTable("ai_generations", {
  id: id("id").primaryKey(),
  projectId: id("project_id").references(() => projects.id, { onDelete: "cascade" }),
  artifactId: id("artifact_id").references(() => artifacts.id, { onDelete: "cascade" }),
  operation: varchar("operation", { length: 120 }).notNull(),
  model: varchar("model", { length: 80 }).notNull(),
  status: generationStatusEnum("status").notNull().default("queued"),
  requestPayload: jsonb("request_payload").$type<Record<string, unknown>>(),
  responsePayload: jsonb("response_payload").$type<Record<string, unknown>>(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const uploadedFiles = pgTable("uploaded_files", {
  id: id("id").primaryKey(),
  projectId: id("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  storageKey: varchar("storage_key", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 120 }).notNull(),
  byteSize: integer("byte_size").notNull(),
  extractedText: text("extracted_text"),
  embedding: vector("embedding", { dimensions: 1536 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const projectsRelations = relations(projects, ({ many, one }) => ({
  workspace: one(workspaces, { fields: [projects.workspaceId], references: [workspaces.id] }),
  nodes: many(projectNodes),
  edges: many(projectEdges),
  artifacts: many(artifacts)
}));

export const artifactsRelations = relations(artifacts, ({ many, one }) => ({
  project: one(projects, { fields: [artifacts.projectId], references: [projects.id] }),
  sections: many(artifactSections)
}));

export const featureFlags = pgTable("feature_flags", {
  id: id("id").primaryKey(),
  workspaceId: id("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
  key: varchar("key", { length: 80 }).notNull(),
  enabled: boolean("enabled").notNull().default(false)
});
