import type { Request, Response } from 'express'
import { authService } from '../services/auth.service.js'
import type { JwtPayload } from '../types/index.js'

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body as { email: string; password: string }
    const result = await authService.login(email, password)
    if (!result) {
      res.status(401).json({ success: false, message: 'Invalid email or password' })
      return
    }
    res.json({ success: true, user: result.user, token: result.token })
  },

  async register(req: Request, res: Response): Promise<void> {
    const { email, username, password, role } = req.body as { email: string; username: string; password: string; role?: string }
    try {
      const result = await authService.register({ email, username, password, role })
      res.status(201).json({ success: true, user: result.user, token: result.token })
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : ''
      if (msg.includes('Unique') || msg.includes('unique')) {
        res.status(400).json({ success: false, message: 'Email or username already exists' })
        return
      }
      throw e
    }
  },

  async profile(req: Request, res: Response): Promise<void> {
    const { userId } = (req as Request & { user: JwtPayload }).user
    const user = await authService.getProfile(userId)
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' })
      return
    }
    res.json({ success: true, data: user })
  },

  async check(req: Request, res: Response): Promise<void> {
    const { userId } = (req as Request & { user: JwtPayload }).user
    const user = await authService.getProfile(userId)
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' })
      return
    }
    res.json({ success: true, user })
  },
}
