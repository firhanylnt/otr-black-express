// Vercel serverless: run "npm run build" first so dist/ exists
import app from '../dist/app.js'
import { getDb } from '../dist/db/init.js'

getDb()

export default app
