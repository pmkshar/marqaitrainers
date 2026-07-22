import { NextResponse } from "next/server";
import { getAppEnvironment } from "@/lib/db";

export async function GET() {
  const env = getAppEnvironment();
  return NextResponse.json({
    status: "ok",
    environment: env,
    vercelEnv: process.env.VERCEL_ENV ?? "local",
    timestamp: new Date().toISOString(),
    note: env === "production"
      ? "LIVE — connected to production database (marqaicourses.com)"
      : env === "demo"
        ? "DEMO — connected to demo/preview database"
        : "LOCAL — connected to local database",
  });
}
