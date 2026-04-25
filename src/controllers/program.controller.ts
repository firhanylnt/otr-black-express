import type { Request, Response } from 'express'
import { programService } from '../services/program.service.js'
import { uploadFileToR2 } from '../services/r2.js'
import { isR2Configured } from '../config.js'

function getFile(req: Request, field: string): Express.Multer.File | undefined {
  const files = (req as Request & { files?: Record<string, Express.Multer.File[]> }).files
  return files?.[field]?.[0]
}

export const programController = {
  async list(req: Request, res: Response): Promise<void> {
    const includeInactive = req.query.includeInactive === 'true'
    const data = await programService.list(includeInactive)
    res.json({ success: true, data })
  },

  async getSchedule(req: Request, res: Response): Promise<void> {
    const data = await programService.getSchedule()
    res.json({ success: true, data })
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const program = await programService.getBySlug(req.params.slug)
    if (!program) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: program })
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    if (isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid program ID' }); return; }
    const program = await programService.getById(id)
    if (!program) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: program })
  },

  async getEpisodes(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    if (isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid program ID' }); return; }
    const data = await programService.getEpisodes(id)
    res.json({ success: true, data })
  },

  async create(req: Request, res: Response): Promise<void> {
    const b = req.body as Record<string, unknown>
    const image = getFile(req, 'image')
    if (image && !isR2Configured()) {
      res.status(503).json({ success: false, message: 'Upload service not configured' })
      return
    }
    let imageUrl = (b.imageUrl as string) ?? null
    if (image) {
      try {
        imageUrl = await uploadFileToR2(image, 'images')
      } catch (e) {
        res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Upload failed' })
        return
      }
    }
    const program = await programService.create({
      title: String(b.title ?? ''),
      slug: b.slug as string | undefined,
      description: (b.description as string) ?? null,
      imageUrl,
      isActive: b.isActive !== false,
      sortOrder: b.sortOrder != null ? Number(b.sortOrder) : 0,
    })
    res.status(201).json({ success: true, data: program })
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    if (isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid program ID' }); return; }
    const b = req.body as Record<string, unknown>
    const image = getFile(req, 'image')
    if (image && !isR2Configured()) {
      res.status(503).json({ success: false, message: 'Upload service not configured' })
      return
    }
    if (image) {
      try {
        b.imageUrl = await uploadFileToR2(image, 'images')
      } catch (e) {
        res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Upload failed' })
        return
      }
    }
    const program = await programService.update(id, {
      title: b.title as string,
      description: b.description as string,
      imageUrl: b.imageUrl as string,
      isActive: b.isActive as boolean,
      sortOrder: b.sortOrder as number,
    })
    res.json({ success: true, data: program })
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    if (isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid program ID' }); return; }
    const deleted = await programService.delete(id)
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true })
  },

  async createEpisode(req: Request, res: Response): Promise<void> {
    const programId = Number(req.params.id)
    if (isNaN(programId)) { res.status(400).json({ success: false, message: 'Invalid program ID' }); return; }
    const b = req.body as Record<string, unknown>
    const audio = getFile(req, 'audio')
    if (audio && !isR2Configured()) {
      res.status(503).json({ success: false, message: 'Upload service not configured' })
      return
    }
    let audioUrl = (b.audioUrl as string) ?? null
    if (audio) {
      try {
        audioUrl = await uploadFileToR2(audio, 'audio')
      } catch (e) {
        res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Upload failed' })
        return
      }
    }
    const episode = await programService.createEpisode(programId, {
      title: String(b.title ?? ''),
      slug: b.slug as string | undefined,
      description: (b.description as string) ?? null,
      audioUrl,
      youtubeUrl: (b.youtubeUrl as string) ?? null,
      duration: b.duration != null ? Number(b.duration) : null,
      publishedAt: (b.publishedAt as string) ?? null,
      sortOrder: b.sortOrder != null ? Number(b.sortOrder) : 0,
    })
    res.status(201).json({ success: true, data: episode })
  },

  async createEpisodesBulk(req: Request, res: Response): Promise<void> {
    const programId = Number(req.params.id)
    if (isNaN(programId)) { res.status(400).json({ success: false, message: 'Invalid program ID' }); return; }
    const episodes = req.body as Record<string, unknown>[]
    if (!Array.isArray(episodes)) {
      res.status(400).json({ success: false, message: 'Expected array' })
      return
    }
    const data = await programService.createEpisodesBulk(programId, episodes.map((b) => ({
      title: String(b.title ?? ''),
      slug: b.slug as string | undefined,
      description: (b.description as string) ?? null,
      audioUrl: (b.audioUrl as string) ?? null,
      youtubeUrl: (b.youtubeUrl as string) ?? null,
      duration: b.duration != null ? Number(b.duration) : null,
      publishedAt: (b.publishedAt as string) ?? null,
      sortOrder: b.sortOrder != null ? Number(b.sortOrder) : 0,
    })))
    res.status(201).json({ success: true, data })
  },

  async getEpisodeById(req: Request, res: Response): Promise<void> {
    const episodeId = Number(req.params.episodeId)
    if (isNaN(episodeId)) { res.status(400).json({ success: false, message: 'Invalid episode ID' }); return; }
    const episode = await programService.getEpisodeById(episodeId)
    if (!episode) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: episode })
  },

  async updateEpisode(req: Request, res: Response): Promise<void> {
    const episodeId = Number(req.params.episodeId)
    if (isNaN(episodeId)) { res.status(400).json({ success: false, message: 'Invalid episode ID' }); return; }
    const b = req.body as Record<string, unknown>
    const audio = getFile(req, 'audio')
    if (audio && !isR2Configured()) {
      res.status(503).json({ success: false, message: 'Upload service not configured' })
      return
    }
    if (audio) {
      try {
        b.audioUrl = await uploadFileToR2(audio, 'audio')
      } catch (e) {
        res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Upload failed' })
        return
      }
    }
    const episode = await programService.updateEpisode(episodeId, {
      title: b.title as string,
      slug: b.slug as string,
      description: b.description as string,
      audioUrl: b.audioUrl as string,
      youtubeUrl: b.youtubeUrl as string,
      duration: b.duration as number,
      publishedAt: b.publishedAt as string,
      sortOrder: b.sortOrder as number,
    })
    res.json({ success: true, data: episode })
  },

  async deleteEpisode(req: Request, res: Response): Promise<void> {
    const episodeId = Number(req.params.episodeId)
    if (isNaN(episodeId)) { res.status(400).json({ success: false, message: 'Invalid episode ID' }); return; }
    const deleted = await programService.deleteEpisode(episodeId)
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true })
  },
}
