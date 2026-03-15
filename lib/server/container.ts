import { AnalystOrchestrator } from "@/lib/domain/workflows/analyst-orchestrator";
import { FileProjectRepository } from "@/lib/server/repositories/project-repository";
import { PostgresProjectRepository } from "@/lib/server/repositories/postgres-project-repository";
import { ArtifactService } from "@/lib/server/services/artifact-service";
import { ProjectService } from "@/lib/server/services/project-service";

const databaseUrl = process.env.DATABASE_URL?.trim();
const repository = databaseUrl ? new PostgresProjectRepository() : new FileProjectRepository();
const orchestrator = new AnalystOrchestrator();

export const projectService = new ProjectService(repository, orchestrator);
export const artifactService = new ArtifactService(repository, orchestrator);
