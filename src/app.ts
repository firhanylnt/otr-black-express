import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { config } from './config.js'
import { apiLimiter } from './middleware/rateLimit.js'
import { errorHandler } from './middleware/errorHandler.js'
import routes from './routes/index.js'

const app = express()

app.use(helmet())
app.use(cors({ origin: config.corsOrigin, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(apiLimiter)
app.use(routes)
app.use(errorHandler)

export default app
