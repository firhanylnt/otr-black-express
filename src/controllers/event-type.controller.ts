import type { Request, Response } from 'express'
import { eventTypeService } from '../services/event-type.service.js'

export const eventTypeController = {
  async list(req: Request, res: Response): Promise<void> {
    const includeInactive = req.query.includeInactive === 'true'
    const data = await eventTypeService.list(includeInactive)
    res.json({ success: true, data })
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const eventType = await eventTypeService.getBySlug(req.params.slug)
    if (!eventType) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: eventType })
  },

  async getById(req: Request, res: Response): Promise<void> {
    const eventType = await eventTypeService.getById(Number(req.params.id))
    if (!eventType) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: eventType })
  },

  async create(req: Request, res: Response): Promise<void> {
    const b = req.body as { name: string; slug?: string; sortOrder?: number }
    const eventType = await eventTypeService.create(b)
    res.status(201).json({ success: true, data: eventType })
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    const b = req.body as { name?: string; slug?: string; sortOrder?: number; isActive?: boolean }
    await eventTypeService.update(id, b)
    const eventType = await eventTypeService.getById(id)
    res.json({ success: true, data: eventType! })
  },

  async toggle(req: Request, res: Response): Promise<void> {
    const eventType = await eventTypeService.toggle(Number(req.params.id))
    if (!eventType) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: eventType })
  },

  async delete(req: Request, res: Response): Promise<void> {
    const deleted = await eventTypeService.delete(Number(req.params.id))
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true })
  },
}
