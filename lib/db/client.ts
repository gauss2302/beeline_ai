import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let dbInstance: ReturnType<typeof drizzle> | null = null;
let poolInstance: Pool | null = null;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!dbInstance) {
    const pool = getPool();
    if (!pool) {
      return null;
    }
    dbInstance = drizzle(pool);
  }

  return dbInstance;
}

export function getPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.DATABASE_POOL_MAX ?? 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000
    });
  }

  return poolInstance;
}

export async function checkDatabaseHealth() {
  const pool = getPool();
  if (!pool) {
    return {
      configured: false,
      healthy: true
    };
  }

  try {
    await pool.query("select 1");
    return {
      configured: true,
      healthy: true
    };
  } catch (error) {
    return {
      configured: true,
      healthy: false,
      message: error instanceof Error ? error.message : "Database health check failed"
    };
  }
}

export function getPersistenceMode() {
  return process.env.DATABASE_URL ? "postgres" : "file";
}
