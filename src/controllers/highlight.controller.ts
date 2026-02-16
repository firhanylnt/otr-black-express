import type { Request, Response } from 'express'
import { highlightService } from '../services/highlight.service.js'
import { uploadFileToR2 } from '../services/r2.js'
import { isR2Configured } from '../config.js'

function getFile(req: Request, field: string): Express.Multer.File | undefined {
  const files = (req as Request & { files?: Record<string, Express.Multer.File[]> }).files
  return files?.[field]?.[0]
}

export const highlightController = {
  async list(req: Request, res: Response): Promise<void> {
    const activeOnly = req.query.active !== 'false'
    const data = await highlightService.list(activeOnly)
    res.json({ success: true, data })
  },

  async listActive(req: Request, res: Response): Promise<void> {
    const data = await highlightService.list(true)
    res.json({ success: true, data })
  },

  async getById(req: Request, res: Response): Promise<void> {
    const highlight = await highlightService.getById(Number(req.params.id))
    if (!highlight) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: highlight })
  },

  async create(req: Request, res: Response): Promise<void> {
    const b = req.body as Record<string, unknown>
    const imageFile = getFile(req, 'image')
    const customImageFile = getFile(req, 'customImage')
    if ((imageFile || customImageFile) && !isR2Configured()) {
      res.status(503).json({ success: false, message: 'Upload service not configured' })
      return
    }
    let image = (b.image as string) ?? null
    let customImage = (b.customImage as string) ?? null
    try {
      if (imageFile) image = await uploadFileToR2(imageFile, 'images')
      if (customImageFile) customImage = await uploadFileToR2(customImageFile, 'images')
    } catch (e) {
      res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Upload failed' })
      return
    }
    const highlight = await highlightService.create({
      position: (b.position as 'main' | 'side') ?? 'main',
      sideIndex: b.sideIndex != null ? Number(b.sideIndex) : null,
      title: String(b.title ?? ''),
      artist: (b.artist as string) ?? null,
      image,
      customImage,
      tag: (b.tag as string) ?? null,
      type: (b.type as string) ?? null,
      link: (b.link as string) ?? null,
      active: b.active !== false,
      sortOrder: b.sortOrder != null ? Number(b.sortOrder) : 0,
    })
    res.status(201).json({ success: true, data: highlight })
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    const b = req.body as Record<string, unknown>
    const imageFile = getFile(req, 'image')
    const customImageFile = getFile(req, 'customImage')
    if ((imageFile || customImageFile) && !isR2Configured()) {
      res.status(503).json({ success: false, message: 'Upload service not configured' })
      return
    }
    try {
      if (imageFile) b.image = await uploadFileToR2(imageFile, 'images')
      if (customImageFile) b.customImage = await uploadFileToR2(customImageFile, 'images')
    } catch (e) {
      res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Upload failed' })
      return
    }
    const highlight = await highlightService.update(id, {
      position: b.position as 'main' | 'side',
      sideIndex: b.sideIndex as number,
      title: b.title as string,
      artist: b.artist as string,
      image: b.image as string,
      customImage: b.customImage as string,
      tag: b.tag as string,
      type: b.type as string,
      link: b.link as string,
      active: b.active as boolean,
      sortOrder: b.sortOrder as number,
    })
    res.json({ success: true, data: highlight })
  },

  async toggle(req: Request, res: Response): Promise<void> {
    const highlight = await highlightService.toggle(Number(req.params.id))
    if (!highlight) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: highlight })
  },

  async delete(req: Request, res: Response): Promise<void> {
    const deleted = await highlightService.delete(Number(req.params.id))
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true })
  },
}
