# AI Business Analyst Workspace

Production-oriented foundation for an AI Business Analyst platform that turns vague product ideas into:

- a living planning graph
- a canonical structured project model
- targeted clarification loops
- editable BRD, PRD, user stories, and acceptance criteria

The product is intentionally visual-first, not chat-first. Canvas, model, and artifacts all operate on the same source of truth.

## What is implemented

### Product workflow

1. Idea intake creates a workspace from a vague prompt with a single idea node.
2. React Flow canvas becomes the discovery surface for decomposition and regrouping.
3. AI clarification asks only high-impact questions tied to missing project fields.
4. The canonical project model is continuously synced from graph plus manual edits.
5. Artifacts are generated section-by-section from the model and remain editable in TipTap.

### PM / BA experience

- analyst cockpit with readiness score and next-best actions
- live coverage metrics for users, scope, risks, metrics, and docs
- quick scenario presets for common discovery starts
- graph inspector with AI expansion and document generation shortcuts
- synchronized canvas, structured model, and artifact views

### Production posture

- multi-stage Docker image with Next.js standalone output
- Docker Compose stack for app + PostgreSQL + pgvector
- health endpoint at `/api/health`
- security headers in Next config
- runtime repository selection:
  - file-backed local mode when `DATABASE_URL` is absent (`.data/projects.json`)
  - Postgres-backed mode when `DATABASE_URL` is set (recommended for MVP; projects are persisted and can be modified and improved via AI)

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zustand
- React Flow
- TipTap
- Drizzle ORM schema definitions
- PostgreSQL with pgvector
- Gemini API (Flash model) for AI analysis; schema-driven JSON output

## Folder structure

```text
app/
  api/                           Project, graph, artifact, clarification, and health routes
components/
  app-shell/                     Workspace shell, cockpit, toolbar, inspectors
  canvas/                        Planning canvas and custom graph nodes
  model/                         Canonical project model editor
  artifacts/                     TipTap artifact workspace
lib/
  ai/                            Modular AI analyzers and generators
  db/                            Drizzle schema and db client
  domain/                        Contracts, analytics, sync logic, and orchestration
  server/                        Repositories, services, and defaults
  state/                         Zustand client store
drizzle/                         Generated drizzle-kit SQL migrations and snapshots
docker/
  postgres/init/                 PostgreSQL bootstrap schema
```

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

If `OPENAI_API_KEY` is omitted, AI features use deterministic fallback outputs for development.

## Local dev with Postgres

To run the app locally against Postgres (e.g. DB in Docker, app with `bun run dev`):

1. Start the database: `docker compose up -d db` (or `make up` then stop the app).
2. In `.env`, set `DATABASE_URL=postgresql://analyst:analyst@localhost:5432/analyst_os`. Do not use host `db` when the app runs on your machine—`db` resolves only inside Docker.
3. Apply the schema: `npm run db:migrate` (runs `docker/postgres/init/01-schema.sql`). Required once per database; safe to re-run (idempotent).
4. Generate or verify Drizzle migrations when the schema changes:
   - `npm run db:generate`
   - `npm run db:check`
   - `npm run db:studio`

Then run the app: `npm run dev` or `bun run dev`.

## Run with Docker Compose

```bash
docker compose up --build
```

Services:

- app: [http://localhost:3000](http://localhost:3000)
- health: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- postgres: `localhost:5432`

Default compose credentials:

- database: `analyst_os`
- user: `analyst`
- password: `analyst`

## Environment

See [.env.example](/Users/nikitashilov/Projects/vincent%20/.env.example).

Key variables:

- `DATABASE_URL` enables Postgres persistence (recommended for MVP); without it, projects are stored in `.data/projects.json`
- `GEMINI_API_KEY` enables real AI generation (intake, clarification, node expansion, artifacts); without it, fallback outputs are used
- `GEMINI_MODEL` defaults to `gemini-1.5-flash`
- `DATABASE_POOL_MAX` controls pool concurrency in production

## Verification

Primary checks used during implementation:

```bash
npm run typecheck
NEXT_DIST_DIR=/tmp/vincent-next npm run build
```

The temporary dist dir avoids workspace disk pressure during CI-like verification.
