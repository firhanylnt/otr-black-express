import app from './app.js'
import { config, isR2Configured } from './config.js'
import { prisma } from './lib/prisma.js'

const KEEPALIVE_INTERVAL_MS = 50_000 // keep connection alive for Supabase/PgBouncer idle timeout

function startConnectionKeepalive() {
  const t = setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (err) {
      console.warn('DB keepalive failed, reconnecting:', (err as Error).message)
      try {
        await prisma.$disconnect()
        await prisma.$connect()
      } catch (e) {
        console.error('DB reconnect failed:', (e as Error).message)
      }
    }
  }, KEEPALIVE_INTERVAL_MS)
  t.unref?.()
}

prisma
  .$connect()
  .then(() => {
    startConnectionKeepalive()
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
