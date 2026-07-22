import { PrismaClient } from '@prisma/client'

/**
 * Database singleton — reuses the PrismaClient across hot-reloads in dev
 * and across serverless invocations in production.
 *
 * GOLDEN RULE: Demo and Production use SEPARATE databases.
 *   - Vercel Preview  → DEMO_DATABASE_URL   (demo / staging data)
 *   - Vercel Prod     → PRODUCTION_DATABASE_URL  (live / real data)
 *   - Local dev       → DATABASE_URL              (SQLite or local Postgres)
 *
 * The environment variable is resolved by Vercel per-deployment context,
 * so the code never mixes data between environments.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

/**
 * Returns the current app environment label.
 * Used by the /api/health endpoint and admin dashboards to surface
 * which database context is active.
 */
export function getAppEnvironment(): 'demo' | 'production' | 'local' {
  if (process.env.VERCEL_ENV === 'production') return 'production'
  if (process.env.VERCEL_ENV === 'preview') return 'demo'
  return 'local'
}
