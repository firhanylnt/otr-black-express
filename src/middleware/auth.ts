import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'

export interface JwtPayload {
  userId: number
  email: string
  role: string
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Unauthorized' })
    return
  }
  try {
    const token = auth.slice(7)
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload
    ;(req as Request & { user: JwtPayload }).user = decoded
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

export function adminOnly(req: Request, res: Response, next: NextFunction): void {
  const user = (req as Request & { user?: JwtPayload }).user
  if (!user || user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin required' })
    return
  }
  next()
}
