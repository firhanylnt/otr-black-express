import app from './app.js'
import { config, isR2Configured } from './config.js'
import { prisma } from './lib/prisma.js'

prisma
  .$connect()
  .then(() => {
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
