import 'dotenv/config'

function required(key: string): string {
  const v = process.env[key]
  if (!v) throw new Error(`Missing env: ${key}`)
  return v
}

function optional(key: string, def: string): string {
  return process.env[key] ?? def
}

export const config = {
  nodeEnv: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '3005'), 10),
  apiPrefix: optional('API_PREFIX', '/api'),
  corsOrigin: optional('CORS_ORIGIN', 'http://localhost:3002').split(',').map((s) => s.trim()),
  frontendUrl: optional('FRONTEND_URL', 'http://localhost:3000'),
  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: optional('JWT_EXPIRES_IN', '7d'),
  },
  database: {
    url: required('DATABASE_URL'),
  },
  r2: {
    accountId: optional('R2_ACCOUNT_ID', ''),
    accessKeyId: optional('R2_ACCESS_KEY_ID', ''),
    secretAccessKey: optional('R2_SECRET_ACCESS_KEY', ''),
    bucketName: optional('R2_BUCKET_NAME', 'otr-uploads'),
    publicUrl: optional('R2_PUBLIC_URL', ''),
  },
} as const

export function isR2Configured(): boolean {
  return !!(
    config.r2.accountId &&
    config.r2.accessKeyId &&
    config.r2.secretAccessKey &&
    config.r2.publicUrl
  )
}
