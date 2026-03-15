#!/usr/bin/env node
/**
 * Applies the Postgres schema (docker/postgres/init/01-schema.sql) to the
 * database in DATABASE_URL. Use when running the app locally against a
 * Postgres instance (e.g. docker compose up -d db with DATABASE_URL=...@localhost:5432/...).
 *
 * Run: npm run db:migrate   (loads .env via node --env-file; Node 20.6+)
 * Or:  DATABASE_URL=postgresql://... node scripts/db-migrate.mjs
 */

import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, "..", "docker", "postgres", "init", "01-schema.sql");

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("DATABASE_URL is not set. Set it to your Postgres URL (e.g. postgresql://analyst:analyst@localhost:5432/analyst_os)");
  process.exit(1);
}

async function main() {
  const sql = await readFile(schemaPath, "utf8");
  const client = new pg.Client({ connectionString: url });
  try {
    await client.connect();
    await client.query(sql);
    console.log("Schema applied successfully.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
