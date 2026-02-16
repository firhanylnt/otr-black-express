import type { Request, Response } from 'express'
import { genreService } from '../services/genre.service.js'

export const genreController = {
  async list(req: Request, res: Response): Promise<void> {
    const includeInactive = req.query.includeInactive === 'true'
    const data = await genreService.list(includeInactive)
    res.json({ success: true, data })
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const genre = await genreService.getBySlug(req.params.slug)
    if (!genre) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: genre })
  },

  async getById(req: Request, res: Response): Promise<void> {
    const genre = await genreService.getById(Number(req.params.id))
    if (!genre) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: genre })
  },

  async create(req: Request, res: Response): Promise<void> {
    const b = req.body as { name: string; slug?: string }
    const genre = await genreService.create(b)
    res.status(201).json({ success: true, data: genre })
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    const b = req.body as { name?: string; slug?: string }
    await genreService.update(id, b)
    const genre = await genreService.getById(id)
    res.json({ success: true, data: genre! })
  },

  async toggle(req: Request, res: Response): Promise<void> {
    const genre = await genreService.toggle(Number(req.params.id))
    if (!genre) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: genre })
  },

  async delete(req: Request, res: Response): Promise<void> {
    const deleted = await genreService.delete(Number(req.params.id))
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true })
  },
}
