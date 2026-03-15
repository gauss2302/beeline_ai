create extension if not exists vector;

do $$
begin
  create type project_node_type as enum (
    'idea',
    'problem',
    'user',
    'stakeholder',
    'goal',
    'feature',
    'requirement',
    'constraint',
    'risk',
    'metric',
    'assumption',
    'open-question'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type artifact_type as enum ('brd', 'prd', 'user-stories', 'acceptance-criteria');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type artifact_status as enum ('draft', 'published');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type generation_status as enum ('queued', 'running', 'succeeded', 'failed');
exception
  when duplicate_object then null;
end $$;

create table if not exists users (
  id varchar(128) primary key,
  email varchar(255) not null unique,
  full_name varchar(255),
  created_at timestamptz not null default now()
);

create table if not exists workspaces (
  id varchar(128) primary key,
  owner_id varchar(128) not null references users(id) on delete cascade,
  title varchar(255) not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists projects (
  id varchar(128) primary key,
  workspace_id varchar(128) not null references workspaces(id) on delete cascade,
  title varchar(255) not null,
  idea text not null,
  summary text not null default '',
  canonical_model jsonb not null,
  analysis_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_workspace_idx on projects(workspace_id);

create table if not exists project_nodes (
  id varchar(128) primary key,
  project_id varchar(128) not null references projects(id) on delete cascade,
  type project_node_type not null,
  title varchar(255) not null,
  description text not null default '',
  details text,
  tags jsonb not null default '[]'::jsonb,
  source_field varchar(64),
  position_x integer not null default 0,
  position_y integer not null default 0,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_nodes_project_idx on project_nodes(project_id);
create index if not exists project_nodes_embedding_idx on project_nodes using hnsw (embedding vector_cosine_ops);

create table if not exists project_edges (
  id varchar(128) primary key,
  project_id varchar(128) not null references projects(id) on delete cascade,
  source_node_id varchar(128) not null references project_nodes(id) on delete cascade,
  target_node_id varchar(128) not null references project_nodes(id) on delete cascade,
  label varchar(120),
  created_at timestamptz not null default now()
);

create index if not exists project_edges_project_idx on project_edges(project_id);

create table if not exists project_model_snapshots (
  id varchar(128) primary key,
  project_id varchar(128) not null references projects(id) on delete cascade,
  source varchar(80) not null,
  model jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists clarification_rounds (
  id varchar(128) primary key,
  project_id varchar(128) not null references projects(id) on delete cascade,
  status generation_status not null default 'queued',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists clarification_answers (
  id varchar(128) primary key,
  round_id varchar(128) not null references clarification_rounds(id) on delete cascade,
  question_id varchar(128) not null,
  field varchar(64) not null,
  prompt text not null,
  answer text not null,
  source_node_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists artifacts (
  id varchar(128) primary key,
  project_id varchar(128) not null references projects(id) on delete cascade,
  type artifact_type not null,
  title varchar(255) not null,
  summary text not null default '',
  status artifact_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists artifact_sections (
  id varchar(128) primary key,
  artifact_id varchar(128) not null references artifacts(id) on delete cascade,
  section_key varchar(120) not null,
  title varchar(255) not null,
  sort_order integer not null default 0,
  content text not null default '',
  source_fields jsonb not null default '[]'::jsonb,
  source_node_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists artifact_sections_artifact_idx on artifact_sections(artifact_id);

create table if not exists artifact_versions (
  id varchar(128) primary key,
  artifact_id varchar(128) not null references artifacts(id) on delete cascade,
  version_number integer not null,
  content jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists ai_generations (
  id varchar(128) primary key,
  project_id varchar(128) references projects(id) on delete cascade,
  artifact_id varchar(128) references artifacts(id) on delete cascade,
  operation varchar(120) not null,
  model varchar(80) not null,
  status generation_status not null default 'queued',
  request_payload jsonb,
  response_payload jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists uploaded_files (
  id varchar(128) primary key,
  project_id varchar(128) not null references projects(id) on delete cascade,
  storage_key varchar(255) not null,
  original_name varchar(255) not null,
  mime_type varchar(120) not null,
  byte_size integer not null,
  extracted_text text,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

create table if not exists feature_flags (
  id varchar(128) primary key,
  workspace_id varchar(128) references workspaces(id) on delete cascade,
  key varchar(80) not null,
  enabled boolean not null default false
);
