import app from './app.js'
import { config, isR2Configured } from './config.js'
import { prisma } from './lib/prisma.js'

// Session keepalive: ping DB regularly so the connection stays active (Prisma, Supabase, PgBouncer, etc.)
const KEEPALIVE_INTERVAL_MS = 30_000 // ping every 30s so session is never idle too long
const KEEPALIVE_FIRST_PING_MS = 10_000 // first ping after 10s
let keepaliveReconnecting = false

function startSessionKeepalive() {
  const ping = async () => {
    if (keepaliveReconnecting) return
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (err) {
      const msg = (err as Error).message
      if (msg.includes('not yet connected')) return
      keepaliveReconnecting = true
      console.warn('DB keepalive failed, reconnecting:', msg)
      try {
        await prisma.$connect()
      } catch (e) {
        console.error('DB reconnect failed:', (e as Error).message)
      } finally {
        keepaliveReconnecting = false
      }
    }
  }
  // First ping sooner so the session is marked active early
  setTimeout(ping, KEEPALIVE_FIRST_PING_MS)
  const t = setInterval(ping, KEEPALIVE_INTERVAL_MS)
  t.unref?.()
}

prisma
  .$connect()
  .then(() => {
    startSessionKeepalive()
    app.listen(config.port, () => {
      console.log(`OTR API listening on port ${config.port}, prefix ${config.apiPrefix}`)
      if (isR2Configured()) {
        console.log(`R2 public URL (upload base): ${config.r2.publicUrl}`)
      }
    })
  })
  .catch((err) => {
    console.error('Database connection failed:', err)
    process.exit(1)
  })
