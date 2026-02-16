import type { Request, Response } from 'express'
import { subscriberService } from '../services/subscriber.service.js'

export const subscriberController = {
  async subscribe(req: Request, res: Response): Promise<void> {
    const { email, name, source } = req.body as { email: string; name?: string; source?: string }
    const result = await subscriberService.subscribe(email, name ?? null, source ?? null)
    if (result === 'created') {
      res.status(201).json({ success: true, message: 'Subscribed' })
    } else {
      res.json({ success: true, message: 'Re-subscribed' })
    }
  },

  async unsubscribe(req: Request, res: Response): Promise<void> {
    const { email } = req.body as { email: string }
    await subscriberService.unsubscribe(email)
    res.json({ success: true, message: 'Unsubscribed' })
  },

  async list(req: Request, res: Response): Promise<void> {
    const { status, search, page, limit } = req.query
    const result = await subscriberService.list({
      status: status as string | undefined,
      search: search as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
    res.json({ success: true, ...result })
  },

  async getStats(req: Request, res: Response): Promise<void> {
    const data = await subscriberService.getStats()
    res.json({ success: true, data })
  },

  async delete(req: Request, res: Response): Promise<void> {
    const deleted = await subscriberService.delete(Number(req.params.id))
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true })
  },
}
