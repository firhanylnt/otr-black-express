import type { Request, Response } from 'express'
import { moodService } from '../services/mood.service.js'

export const moodController = {
  async list(req: Request, res: Response): Promise<void> {
    const includeInactive = req.query.includeInactive === 'true'
    const data = await moodService.list(includeInactive)
    res.json({ success: true, data })
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const mood = await moodService.getBySlug(req.params.slug)
    if (!mood) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: mood })
  },

  async getById(req: Request, res: Response): Promise<void> {
    const mood = await moodService.getById(Number(req.params.id))
    if (!mood) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: mood })
  },

  async create(req: Request, res: Response): Promise<void> {
    const b = req.body as { name: string; slug?: string }
    const mood = await moodService.create(b)
    res.status(201).json({ success: true, data: mood })
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    const b = req.body as { name?: string; slug?: string }
    await moodService.update(id, b)
    const mood = await moodService.getById(id)
    res.json({ success: true, data: mood! })
  },

  async toggle(req: Request, res: Response): Promise<void> {
    const mood = await moodService.toggle(Number(req.params.id))
    if (!mood) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: mood })
  },

  async delete(req: Request, res: Response): Promise<void> {
    const deleted = await moodService.delete(Number(req.params.id))
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true })
  },
}
