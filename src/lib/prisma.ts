import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

/**
 * Supabase: keep connection_limit low to avoid "MaxClientsInSessionMode" and pool timeouts.
 * Prefer Transaction mode (port 6543): ...@host:6543/postgres?pgbouncer=true&connection_limit=1
 */
function getDatasourceUrl(): string {
  const url = process.env.DATABASE_URL ?? ''
  if (!url) return url
  try {
    const parsed = new URL(url)
    const isSupabase = parsed.hostname?.includes('supabase') ?? false
    if (isSupabase) {
      const limit = parsed.searchParams.get('connection_limit')
      const safeLimit = limit ? Math.min(parseInt(limit, 10) || 1, 2) : 1
      parsed.searchParams.set('connection_limit', String(safeLimit))
      return parsed.toString()
    }
    return url
  } catch {
    return url
  }
}

const datasourceUrl = getDatasourceUrl()

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    ...(datasourceUrl && { datasources: { db: { url: datasourceUrl } } }),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
