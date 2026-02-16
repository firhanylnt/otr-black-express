import type { Request, Response } from 'express'
import { eventService } from '../services/event.service.js'
import { uploadFileToR2 } from '../services/r2.js'
import { isR2Configured } from '../config.js'

function getFile(req: Request, field: string): Express.Multer.File | undefined {
  const files = (req as Request & { files?: Record<string, Express.Multer.File[]> }).files
  return files?.[field]?.[0]
}

export const eventController = {
  async list(req: Request, res: Response): Promise<void> {
    const { status, search, page, limit } = req.query
    const result = await eventService.list({
      status: status as string | undefined,
      search: search as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
    res.json({ success: true, ...result })
  },

  async listUpcoming(req: Request, res: Response): Promise<void> {
    const data = await eventService.listUpcoming()
    res.json({ success: true, data })
  },

  async listPast(req: Request, res: Response): Promise<void> {
    const limit = Number(req.query.limit) || 10
    const data = await eventService.listPast(limit)
    res.json({ success: true, data })
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const event = await eventService.getBySlug(req.params.slug)
    if (!event) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: event })
  },

  async getById(req: Request, res: Response): Promise<void> {
    const event = await eventService.getById(Number(req.params.id))
    if (!event) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: event })
  },

  async create(req: Request, res: Response): Promise<void> {
    const b = req.body as Record<string, unknown>
    const cover = getFile(req, 'cover')
    const banner = getFile(req, 'banner')
    if ((cover || banner) && !isR2Configured()) {
      res.status(503).json({ success: false, message: 'Upload service not configured' })
      return
    }
    let coverUrl = (b.coverUrl as string) ?? null
    let bannerUrl = (b.bannerUrl as string) ?? null
    try {
      if (cover) coverUrl = await uploadFileToR2(cover, 'images')
      if (banner) bannerUrl = await uploadFileToR2(banner, 'images')
    } catch (e) {
      res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Upload failed' })
      return
    }
    const slug = (b.slug as string) || String(b.title).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const event = await eventService.create({
      title: String(b.title ?? ''),
      slug,
      description: (b.description as string) ?? null,
      coverUrl,
      bannerUrl,
      venue: (b.venue as string) ?? null,
      address: (b.address as string) ?? null,
      city: (b.city as string) ?? null,
      country: (b.country as string) ?? null,
      startDate: (b.startDate as string) ?? null,
      endDate: (b.endDate as string) ?? null,
      ticketUrl: (b.ticketUrl as string) ?? null,
      price: (b.price as string) ?? null,
      isFree: Boolean(b.isFree),
      status: (b.status as 'upcoming' | 'ongoing' | 'past' | 'cancelled') ?? 'upcoming',
    })
    res.status(201).json({ success: true, data: event })
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    const existing = await eventService.getById(id)
    if (!existing) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    const b = req.body as Record<string, unknown>
    const cover = getFile(req, 'cover')
    const banner = getFile(req, 'banner')
    if ((cover || banner) && !isR2Configured()) {
      res.status(503).json({ success: false, message: 'Upload service not configured' })
      return
    }
    try {
      if (cover) b.coverUrl = await uploadFileToR2(cover, 'images')
      if (banner) b.bannerUrl = await uploadFileToR2(banner, 'images')
    } catch (e) {
      res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Upload failed' })
      return
    }
    const updates: Record<string, unknown> = {}
    const keys = ['title', 'description', 'coverUrl', 'bannerUrl', 'venue', 'address', 'city', 'country', 'startDate', 'endDate', 'ticketUrl', 'price', 'isFree', 'status']
    for (const k of keys) {
      if (b[k] !== undefined) updates[k] = k === 'isFree' ? Boolean(b[k]) : b[k]
    }
    const event = await eventService.update(id, updates as Parameters<typeof eventService.update>[1])
    res.json({ success: true, data: event })
  },

  async delete(req: Request, res: Response): Promise<void> {
    const deleted = await eventService.delete(Number(req.params.id))
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true })
  },
}
