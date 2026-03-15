import { NextResponse } from "next/server";
import { checkDatabaseHealth, getPersistenceMode } from "@/lib/db/client";
import { failure } from "@/lib/server/http";

export async function GET() {
  try {
    const database = await checkDatabaseHealth();
    const healthy = database.healthy;

    return NextResponse.json(
      {
        status: healthy ? "ok" : "degraded",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round(process.uptime()),
        persistenceMode: getPersistenceMode(),
        database
      },
      { status: healthy ? 200 : 503 }
    );
  } catch (error) {
    return failure(error, 503);
  }
}
