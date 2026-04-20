import type { Request, Response } from 'express'
import { contentService } from '../services/content.service.js'
import { uploadFileToR2 } from '../services/r2.js'
import { isR2Configured } from '../config.js'
import type { JwtPayload } from '../types/index.js'

function getFiles(req: Request): { cover?: Express.Multer.File; audio?: Express.Multer.File } {
  const files = (req as Request & { files?: Record<string, Express.Multer.File[]> }).files
  if (!files) return {}
  return {
    cover: files.cover?.[0],
    audio: files.audio?.[0],
  }
}

export const songController = {
  async list(req: Request, res: Response): Promise<void> {
    const { genre, mood, search, category, page, limit } = req.query
    const result = await contentService.listSongsPublic({
      genre: genre as string | undefined,
      mood: mood as string | undefined,
      search: search as string | undefined,
      category: category as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
    res.json({ success: true, ...result })
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { status, genre, search, page, limit } = req.query
      const str = (v: unknown) => (typeof v === 'string' && v && v !== 'undefined' && v !== 'null' ? v : undefined)
      const result = await contentService.listSongsAdmin({
        status: str(status),
        genre: str(genre),
        search: str(search),
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      })
      res.json({
        success: true,
        data: Array.isArray(result?.data) ? result.data : [],
        meta: result?.meta ?? { total: 0, page: 1, limit: 20, totalPages: 0 },
      })
    } catch (err) {
      console.error('listAdmin error:', err)
      res.status(500).json({
        success: false,
        message: (err as Error).message,
        data: [],
        meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
      })
    }
  },

  async listPending(req: Request, res: Response): Promise<void> {
    const data = await contentService.listPendingSongs()
    res.json({ success: true, data })
  },

  async listMySongs(req: Request, res: Response): Promise<void> {
    const { userId } = (req as Request & { user: JwtPayload }).user
    const { status, page, limit } = req.query
    const result = await contentService.listMySongs(userId, {
      status: status as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
    res.json({ success: true, ...result })
  },

  async getStats(req: Request, res: Response): Promise<void> {
    const data = await contentService.getSongStats()
    res.json({ success: true, data })
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const song = await contentService.getBySlug(req.params.slug)
    if (!song) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: song })
  },

  async getById(req: Request, res: Response): Promise<void> {
    const song = await contentService.getById(Number(req.params.id))
    if (!song) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: song })
  },

  async create(req: Request, res: Response): Promise<void> {
    const { userId, role } = (req as Request & { user: JwtPayload }).user
    const b = req.body as Record<string, unknown>
    const { cover, audio } = getFiles(req)
    if ((cover || audio) && !isR2Configured()) {
      res.status(503).json({ success: false, message: 'Upload service not configured' })
      return
    }
    let coverUrl = (b.coverUrl as string) ?? null
    let audioUrl = (b.audioUrl as string) ?? null
    try {
      if (cover) coverUrl = await uploadFileToR2(cover, 'images')
      if (audio) audioUrl = await uploadFileToR2(audio, 'audio')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed'
      res.status(400).json({ success: false, message: msg })
      return
    }
    const slug = (b.slug as string) || String(b.title).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const isAdmin = role === 'admin'
    const status =
      isAdmin
        ? ((b.status as 'pending' | 'published') === 'published' ? 'published' : 'pending')
        : 'pending'
    const tagsRaw = b.tags ?? b.moods ?? b.moodIds
    const tagsValue =
      tagsRaw == null
        ? null
        : Array.isArray(tagsRaw)
          ? JSON.stringify(tagsRaw.map((v: unknown) => (typeof v === 'number' ? v : String(v))))
          : String(tagsRaw)
    const genresRaw = b.genres ?? b.genreIds
    const genresValue =
      genresRaw == null
        ? null
        : Array.isArray(genresRaw)
          ? JSON.stringify(genresRaw)
          : String(genresRaw)
    const song = await contentService.create({
      title: String(b.title ?? ''),
      slug,
      description: (b.description as string) ?? null,
      type: (b.type as 'track' | 'album' | 'mixtape') ?? 'track',
      category: (b.category as string) ?? 'guests',
      coverUrl,
      audioUrl,
      videoUrl: (b.videoUrl as string) ?? null,
      youtubeEmbed: (b.youtubeEmbed as string) ?? null,
      duration: b.duration != null ? Number(b.duration) : null,
      releaseDate: (b.releaseDate as string) ?? null,
      status,
      creatorId: userId,
      tags: tagsValue,
      genres: genresValue,
    })
    res.status(201).json({ success: true, data: song })
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    const existing = await contentService.getById(id)
    if (!existing) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    const b = req.body as Record<string, unknown>
    const { cover, audio } = getFiles(req)
    if ((cover || audio) && !isR2Configured()) {
      res.status(503).json({ success: false, message: 'Upload service not configured' })
      return
    }
    try {
      if (cover) b.coverUrl = await uploadFileToR2(cover, 'images')
      if (audio) b.audioUrl = await uploadFileToR2(audio, 'audio')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed'
      res.status(400).json({ success: false, message: msg })
      return
    }
    const updates: Record<string, unknown> = {}
    const tagsInput = b.tags ?? b.moods ?? b.moodIds
    const genresInput = b.genres ?? b.genreIds
    const map: Record<string, string> = {
      title: 'title', description: 'description', coverUrl: 'coverUrl', audioUrl: 'audioUrl',
      videoUrl: 'videoUrl', youtubeEmbed: 'youtubeEmbed', duration: 'duration', releaseDate: 'releaseDate',
      status: 'status', tags: 'tags', genres: 'genres',
    }
    const toTagOrNum = (v: unknown): string | number => (typeof v === 'number' ? v : String(v))
    for (const [k, col] of Object.entries(map)) {
      if (k === 'tags' && tagsInput !== undefined) {
        const arr: (string | number)[] | unknown = Array.isArray(tagsInput)
          ? tagsInput.map(toTagOrNum)
          : tagsInput
        ;(updates as Record<string, unknown>)[col] = Array.isArray(arr) ? JSON.stringify(arr) : arr
      } else if (k === 'genres' && genresInput !== undefined) {
        (updates as Record<string, unknown>)[col] = Array.isArray(genresInput) ? JSON.stringify(genresInput) : genresInput
      } else if (b[k] !== undefined) {
        (updates as Record<string, unknown>)[col] = b[k]
      }
    }
    const song = await contentService.update(id, updates as Parameters<typeof contentService.update>[1])
    res.json({ success: true, data: song })
  },

  async approve(req: Request, res: Response): Promise<void> {
    const { userId } = (req as Request & { user: JwtPayload }).user
    const song = await contentService.approve(Number(req.params.id), userId)
    res.json({ success: true, data: song })
  },

  async reject(req: Request, res: Response): Promise<void> {
    const reason = (req.body as { reason?: string }).reason ?? null
    const song = await contentService.reject(Number(req.params.id), reason)
    res.json({ success: true, data: song })
  },

  async hide(req: Request, res: Response): Promise<void> {
    const song = await contentService.hide(Number(req.params.id))
    res.json({ success: true, data: song })
  },

  async publish(req: Request, res: Response): Promise<void> {
    const song = await contentService.publish(Number(req.params.id))
    res.json({ success: true, data: song })
  },

  async play(req: Request, res: Response): Promise<void> {
    const song = await contentService.incrementPlay(Number(req.params.id))
    if (!song) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: song })
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
