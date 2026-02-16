import type { Request, Response, NextFunction } from 'express'
import { config } from '../config.js'

export function errorHandler(
  err: Error & { statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.statusCode ?? 500
  const message = err.message ?? 'Internal server error'
  if (config.nodeEnv === 'production') {
    res.status(status).json({ success: false, message: 'Something went wrong' })
  } else {
    res.status(status).json({ success: false, message, stack: err.stack })
  }
}
