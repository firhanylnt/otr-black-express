import type { Request, Response } from 'express'
import { settingsService } from '../services/settings.service.js'

export const settingsController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const data = await settingsService.getAll()
    res.json({ success: true, data })
  },

  async getByGroup(req: Request, res: Response): Promise<void> {
    const data = await settingsService.getByGroup(req.params.group)
    res.json({ success: true, data })
  },

  async upsertMany(req: Request, res: Response): Promise<void> {
    const items = req.body as { key: string; value: string }[]
    if (!Array.isArray(items)) {
      res.status(400).json({ success: false, message: 'Expected array' })
      return
    }
    await settingsService.upsertMany(items)
    res.json({ success: true })
  },
}
