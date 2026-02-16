import type { Request, Response } from 'express'
import { historyService } from '../services/history.service.js'
import type { JwtPayload } from '../types/index.js'

export const historyController = {
  async logPlay(req: Request, res: Response): Promise<void> {
    const { userId } = (req as Request & { user: JwtPayload }).user
    const { songId, duration, position } = req.body as { songId: string; duration?: number; position?: number }
    await historyService.logPlay(userId, Number(songId), duration, position)
    res.json({ success: true })
  },

  async getMyHistory(req: Request, res: Response): Promise<void> {
    const { userId } = (req as Request & { user: JwtPayload }).user
    const limit = Number(req.query.limit) || 50
    const offset = Number(req.query.offset) || 0
    const data = await historyService.getMyHistory(userId, limit, offset)
    res.json({ success: true, data })
  },

  async updateProgress(req: Request, res: Response): Promise<void> {
    const { userId } = (req as Request & { user: JwtPayload }).user
    const { songId, currentPosition, duration, listenedDuration, incrementPlay } = req.body as {
      songId: string
      currentPosition: number
      duration?: number
      listenedDuration?: number
      incrementPlay?: boolean
    }
    await historyService.updateProgress(userId, Number(songId), currentPosition, duration, listenedDuration, incrementPlay)
    res.json({ success: true })
  },

  async syncHistory(req: Request, res: Response): Promise<void> {
    const { userId } = (req as Request & { user: JwtPayload }).user
    const { history } = req.body as { history: { songId: string; position: number; duration?: number; listenedDuration?: number }[] }
    if (!Array.isArray(history)) {
      res.status(400).json({ success: false, message: 'history array required' })
      return
    }
    await historyService.syncHistory(userId, history)
    res.json({ success: true })
  },

  async getAnalytics(req: Request, res: Response): Promise<void> {
    const data = await historyService.getAnalytics()
    res.json({ success: true, data })
  },

  async getTopSongs(req: Request, res: Response): Promise<void> {
    const limit = Number(req.query.limit) || 10
    const data = await historyService.getTopSongs(limit)
    res.json({ success: true, data })
  },

  async getTopListeners(req: Request, res: Response): Promise<void> {
    const limit = Number(req.query.limit) || 10
    const data = await historyService.getTopListeners(limit)
    res.json({ success: true, data })
  },

  async getDailyPlays(req: Request, res: Response): Promise<void> {
    const days = Number(req.query.days) || 30
    const data = await historyService.getDailyPlays(days)
    res.json({ success: true, data })
  },
}
