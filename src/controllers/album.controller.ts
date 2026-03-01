import type { Request, Response } from 'express'
import type { ContentStatus } from '@prisma/client'
import { contentService } from '../services/content.service.js'
import { uploadFileToR2 } from '../services/r2.js'
import { isR2Configured } from '../config.js'
import type { JwtPayload } from '../types/index.js'

function getFile(req: Request, field: string): Express.Multer.File | undefined {
  const files = (req as Request & { files?: Record<string, Express.Multer.File[]> }).files
  return files?.[field]?.[0]
}

export const albumController = {
  async list(req: Request, res: Response): Promise<void> {
    const { status, type, page, limit } = req.query
    const result = await contentService.listByType('album', {
      status: status as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
    res.json({ success: true, ...result })
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const album = await contentService.getBySlugAndType(req.params.slug, 'album')
    if (!album) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: album })
  },

  async getById(req: Request, res: Response): Promise<void> {
    const album = await contentService.getByIdAndType(Number(req.params.id), 'album')
    if (!album) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: album })
  },

  async create(req: Request, res: Response): Promise<void> {
    const { userId } = (req as Request & { user: JwtPayload }).user
    const b = req.body as Record<string, unknown>
    const cover = getFile(req, 'cover')
    if (cover && !isR2Configured()) {
      res.status(503).json({ success: false, message: 'Upload service not configured' })
      return
    }
    let coverUrl = (b.coverUrl as string) ?? null
    if (cover) {
      try {
        coverUrl = await uploadFileToR2(cover, 'images')
      } catch (e) {
        res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Upload failed' })
        return
      }
    }
    const slug = (b.slug as string) || String(b.title).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const album = await contentService.create({
      title: String(b.title ?? ''),
      slug,
      description: (b.description as string) ?? null,
      type: 'album',
      category: (b.category as 'picks' | 'residents' | 'guests' | 'featured' | 'program') ?? 'guests',
      coverUrl,
      status: (b.status as ContentStatus) ?? 'pending',
      creatorId: userId,
    })
    res.status(201).json({ success: true, data: album })
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    const existing = await contentService.getByIdAndType(id, 'album')
    if (!existing) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    const b = req.body as Record<string, unknown>
    const cover = getFile(req, 'cover')
    if (cover && !isR2Configured()) {
      res.status(503).json({ success: false, message: 'Upload service not configured' })
      return
    }
    if (cover) {
      try {
        b.coverUrl = await uploadFileToR2(cover, 'images')
      } catch (e) {
        res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Upload failed' })
        return
      }
    }
    const album = await contentService.update(id, {
      title: b.title as string,
      description: b.description as string,
      coverUrl: b.coverUrl as string,
      status: b.status as ContentStatus,
    })
    res.json({ success: true, data: album })
  },

  async delete(req: Request, res: Response): Promise<void> {
    const deleted = await contentService.delete(Number(req.params.id))
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true })
  },
}
