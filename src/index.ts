import app from './app.js'
import { config } from './config.js'
import { prisma } from './lib/prisma.js'

prisma
  .$connect()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`OTR API listening on port ${config.port}, prefix ${config.apiPrefix}`)
    })
  })
  .catch((err) => {
    console.error('Database connection failed:', err)
    process.exit(1)
  })
