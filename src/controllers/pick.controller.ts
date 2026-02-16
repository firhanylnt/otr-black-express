import type { Request, Response } from 'express'
import { pickService } from '../services/pick.service.js'

export const pickController = {
  async list(req: Request, res: Response): Promise<void> {
    const { type, page, limit } = req.query
    const result = await pickService.list({
      type: type as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
    res.json({ success: true, ...result })
  },

  async getById(req: Request, res: Response): Promise<void> {
    const pick = await pickService.getById(Number(req.params.id))
    if (!pick) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: pick })
  },

  async create(req: Request, res: Response): Promise<void> {
    const b = req.body as { contentType: string; contentId: string; curatorNote?: string }
    const pick = await pickService.create({
      contentType: b.contentType,
      contentId: Number(b.contentId),
      curatorNote: b.curatorNote ?? null,
    })
    res.status(201).json({ success: true, data: pick })
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    const b = req.body as { curatorNote?: string; sortOrder?: number; isActive?: boolean }
    const pick = await pickService.update(id, b)
    res.json({ success: true, data: pick })
  },

  async delete(req: Request, res: Response): Promise<void> {
    const deleted = await pickService.delete(Number(req.params.id))
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true })
  },
}
