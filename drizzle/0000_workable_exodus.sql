CREATE TYPE "public"."artifact_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."artifact_type" AS ENUM('brd', 'prd', 'user-stories', 'acceptance-criteria');--> statement-breakpoint
CREATE TYPE "public"."generation_status" AS ENUM('queued', 'running', 'succeeded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."project_node_type" AS ENUM('idea', 'problem', 'user', 'stakeholder', 'goal', 'feature', 'requirement', 'constraint', 'risk', 'metric', 'assumption', 'open-question');--> statement-breakpoint
CREATE TABLE "ai_generations" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"project_id" varchar(128),
	"artifact_id" varchar(128),
	"operation" varchar(120) NOT NULL,
	"model" varchar(80) NOT NULL,
	"status" "generation_status" DEFAULT 'queued' NOT NULL,
	"request_payload" jsonb,
	"response_payload" jsonb,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "artifact_sections" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"artifact_id" varchar(128) NOT NULL,
	"section_key" varchar(120) NOT NULL,
	"title" varchar(255) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"source_fields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source_node_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "artifact_versions" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"artifact_id" varchar(128) NOT NULL,
	"version_number" integer NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "artifacts" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"project_id" varchar(128) NOT NULL,
	"type" "artifact_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"status" "artifact_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clarification_answers" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"round_id" varchar(128) NOT NULL,
	"question_id" varchar(128) NOT NULL,
	"field" varchar(64) NOT NULL,
	"prompt" text NOT NULL,
	"answer" text NOT NULL,
	"source_node_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clarification_rounds" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"project_id" varchar(128) NOT NULL,
	"status" "generation_status" DEFAULT 'queued' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"workspace_id" varchar(128),
	"key" varchar(80) NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_edges" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"project_id" varchar(128) NOT NULL,
	"source_node_id" varchar(128) NOT NULL,
	"target_node_id" varchar(128) NOT NULL,
	"label" varchar(120),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_model_snapshots" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"project_id" varchar(128) NOT NULL,
	"source" varchar(80) NOT NULL,
	"model" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_nodes" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"project_id" varchar(128) NOT NULL,
	"type" "project_node_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"details" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source_field" varchar(64),
	"position_x" integer DEFAULT 0 NOT NULL,
	"position_y" integer DEFAULT 0 NOT NULL,
	"embedding" vector(1536),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"workspace_id" varchar(128) NOT NULL,
	"title" varchar(255) NOT NULL,
	"idea" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"canonical_model" jsonb NOT NULL,
	"analysis_state" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "uploaded_files" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"project_id" varchar(128) NOT NULL,
	"storage_key" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"mime_type" varchar(120) NOT NULL,
	"byte_size" integer NOT NULL,
	"extracted_text" text,
	"embedding" vector(1536),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"owner_id" varchar(128) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_artifact_id_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artifact_sections" ADD CONSTRAINT "artifact_sections_artifact_id_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artifact_versions" ADD CONSTRAINT "artifact_versions_artifact_id_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clarification_answers" ADD CONSTRAINT "clarification_answers_round_id_clarification_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."clarification_rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clarification_rounds" ADD CONSTRAINT "clarification_rounds_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_edges" ADD CONSTRAINT "project_edges_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_edges" ADD CONSTRAINT "project_edges_source_node_id_project_nodes_id_fk" FOREIGN KEY ("source_node_id") REFERENCES "public"."project_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_edges" ADD CONSTRAINT "project_edges_target_node_id_project_nodes_id_fk" FOREIGN KEY ("target_node_id") REFERENCES "public"."project_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_model_snapshots" ADD CONSTRAINT "project_model_snapshots_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_nodes" ADD CONSTRAINT "project_nodes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uploaded_files" ADD CONSTRAINT "uploaded_files_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "artifact_sections_artifact_idx" ON "artifact_sections" USING btree ("artifact_id");--> statement-breakpoint
CREATE INDEX "project_edges_project_idx" ON "project_edges" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_nodes_project_idx" ON "project_nodes" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_nodes_embedding_idx" ON "project_nodes" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "projects_workspace_idx" ON "projects" USING btree ("workspace_id");