import { prisma } from '../lib/prisma.js'
import type { ContentType, ContentStatus } from '@prisma/client'
import type { Prisma } from '@prisma/client'

const SONG_TYPES: ContentType[] = ['track', 'album', 'mixtape']
const DEFAULT_LIMIT = 20

function toSongDto(c: {
  id: number
  title: string
  slug: string
  description: string | null
  type: string
  category: string
  coverUrl: string | null
  audioUrl: string | null
  videoUrl: string | null
  youtubeEmbed: string | null
  duration: number | null
  releaseDate: string | null
  scheduledAt: string | null
  status: string
  rejectionReason: string | null
  creatorId: number | null
  reviewedBy: number | null
  reviewedAt: Date | null
  plays: number
  likes: number
  tags: string | null
  genres: string | null
  isHighlighted: number
  isFeaturedHome: number
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: c.id,
    title: c.title,
    slug: c.slug,
    description: c.description,
    type: c.type,
    category: c.category,
    coverUrl: c.coverUrl,
    audioUrl: c.audioUrl,
    videoUrl: c.videoUrl,
    youtubeEmbed: c.youtubeEmbed,
    duration: c.duration,
    releaseDate: c.releaseDate,
    scheduledAt: c.scheduledAt,
    status: c.status,
    rejectionReason: c.rejectionReason,
    creatorId: c.creatorId,
    reviewedBy: c.reviewedBy,
    reviewedAt: c.reviewedAt,
    plays: c.plays ?? 0,
    likes: c.likes ?? 0,
    tags: c.tags ? JSON.parse(c.tags) : [],
    genres: c.genres ? JSON.parse(c.genres) : [],
    isHighlighted: Boolean(c.isHighlighted),
    isFeaturedHome: Boolean(c.isFeaturedHome),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }
}

export const contentService = {
  async listSongsPublic(filters: { genre?: string; mood?: string; search?: string; page?: number; limit?: number }) {
    const page = Number(filters.page) || 1
    const limit = Number(filters.limit) || DEFAULT_LIMIT
    const where: Prisma.ContentWhereInput = {
      type: { in: SONG_TYPES },
      status: 'published',
    }
    if (filters.genre) where.genres = { contains: filters.genre, mode: 'insensitive' }
    if (filters.mood) where.tags = { contains: filters.mood, mode: 'insensitive' }
    if (filters.search) where.OR = [{ title: { contains: filters.search, mode: 'insensitive' } }, { description: { contains: filters.search, mode: 'insensitive' } }]
    const [rows, total] = await Promise.all([
      prisma.content.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.content.count({ where }),
    ])
    return { data: rows.map(toSongDto), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  },

  async listSongsAdmin(filters: { status?: string; genre?: string; search?: string; page?: number; limit?: number }) {
    const page = Number(filters.page) || 1
    const limit = Number(filters.limit) || DEFAULT_LIMIT
    const where: Prisma.ContentWhereInput = { type: { in: SONG_TYPES } }
    if (filters.status) where.status = filters.status as ContentStatus
    if (filters.genre) where.genres = { contains: filters.genre, mode: 'insensitive' }
    if (filters.search) where.OR = [{ title: { contains: filters.search, mode: 'insensitive' } }, { description: { contains: filters.search, mode: 'insensitive' } }]
    const [rows, total] = await Promise.all([
      prisma.content.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.content.count({ where }),
    ])
    return { data: rows.map(toSongDto), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  },

  async listPendingSongs() {
    const rows = await prisma.content.findMany({
      where: { type: { in: SONG_TYPES }, status: 'pending' },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map(toSongDto)
  },

  async listMySongs(userId: number, filters: { status?: string; page?: number; limit?: number }) {
    const page = Number(filters.page) || 1
    const limit = Number(filters.limit) || DEFAULT_LIMIT
    const where: { type: { in: ContentType[] }; creatorId: number; status?: ContentStatus } = { type: { in: SONG_TYPES }, creatorId: userId }
    if (filters.status) where.status = filters.status as ContentStatus
    const [rows, total] = await Promise.all([
      prisma.content.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.content.count({ where }),
    ])
    return { data: rows.map(toSongDto), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  },

  async getSongStats() {
    const [total, pending, published, sumPlays] = await Promise.all([
      prisma.content.count({ where: { type: { in: SONG_TYPES } } }),
      prisma.content.count({ where: { type: { in: SONG_TYPES }, status: 'pending' } }),
      prisma.content.count({ where: { type: { in: SONG_TYPES }, status: 'published' } }),
      prisma.content.aggregate({ where: { type: { in: SONG_TYPES } }, _sum: { plays: true } }).then((r) => r._sum.plays ?? 0),
    ])
    return {
      total,
      pending,
      published,
      totalPlays: sumPlays,
      totalSongs: total,
      pendingCount: pending,
    }
  },

  async getBySlug(slug: string, types: ContentType[] = SONG_TYPES) {
    const c = await prisma.content.findFirst({ where: { slug, type: { in: types } } })
    return c ? toSongDto(c) : null
  },

  async getById(id: number, types: ContentType[] = SONG_TYPES) {
    const c = await prisma.content.findFirst({ where: { id, type: { in: types } } })
    return c ? toSongDto(c) : null
  },

  async create(data: {
    title: string
    slug: string
    description?: string | null
    type: ContentType
    category: string
    coverUrl?: string | null
    audioUrl?: string | null
    videoUrl?: string | null
    youtubeEmbed?: string | null
    duration?: number | null
    releaseDate?: string | null
    status?: ContentStatus
    creatorId: number
    tags?: string | null
    genres?: string | null
  }) {
    const c = await prisma.content.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description ?? null,
        type: data.type,
        category: data.category as 'picks' | 'residents' | 'guests' | 'featured' | 'program',
        coverUrl: data.coverUrl ?? null,
        audioUrl: data.audioUrl ?? null,
        videoUrl: data.videoUrl ?? null,
        youtubeEmbed: data.youtubeEmbed ?? null,
        duration: data.duration ?? null,
        releaseDate: data.releaseDate ?? null,
        status: data.status ?? 'pending',
        creatorId: data.creatorId,
        tags: data.tags ?? null,
        genres: data.genres ?? null,
      },
    })
    return toSongDto(c)
  },

  async update(id: number, data: Partial<{ title: string; description: string; coverUrl: string; audioUrl: string; videoUrl: string; youtubeEmbed: string; duration: number; releaseDate: string; status: ContentStatus; tags: string; genres: string }>) {
    const c = await prisma.content.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.coverUrl !== undefined && { coverUrl: data.coverUrl }),
        ...(data.audioUrl !== undefined && { audioUrl: data.audioUrl }),
        ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
        ...(data.youtubeEmbed !== undefined && { youtubeEmbed: data.youtubeEmbed }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.releaseDate !== undefined && { releaseDate: data.releaseDate }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.tags !== undefined && { tags: typeof data.tags === 'string' ? data.tags : JSON.stringify(data.tags) }),
        ...(data.genres !== undefined && { genres: typeof data.genres === 'string' ? data.genres : JSON.stringify(data.genres) }),
      },
    })
    return toSongDto(c)
  },

  async approve(id: number, reviewedBy: number) {
    const c = await prisma.content.update({
      where: { id },
      data: { status: 'approved', reviewedBy, reviewedAt: new Date() },
    })
    return toSongDto(c)
  },

  async reject(id: number, reason: string | null) {
    const c = await prisma.content.update({
      where: { id },
      data: { status: 'rejected', rejectionReason: reason },
    })
    return toSongDto(c)
  },

  async hide(id: number) {
    const c = await prisma.content.update({
      where: { id },
      data: { status: 'draft' },
    })
    return toSongDto(c)
  },

  async publish(id: number) {
    const c = await prisma.content.update({
      where: { id },
      data: { status: 'published' },
    })
    return toSongDto(c)
  },

  async incrementPlay(id: number) {
    await prisma.content.update({
      where: { id },
      data: { plays: { increment: 1 } },
    })
    return this.getById(id)
  },

  async delete(id: number): Promise<boolean> {
    const result = await prisma.content.deleteMany({ where: { id } })
    return result.count > 0
  },

  async listByType(type: ContentType, filters: { status?: string; page?: number; limit?: number }) {
    const page = Number(filters.page) || 1
    const limit = Number(filters.limit) || DEFAULT_LIMIT
    const where: { type: ContentType; status?: ContentStatus } = { type }
    if (filters.status) where.status = filters.status as ContentStatus
    const [rows, total] = await Promise.all([
      prisma.content.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.content.count({ where }),
    ])
    const toAlbumPlaylist = (c: typeof rows[0]) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      type: c.type,
      category: c.category,
      coverUrl: c.coverUrl,
      audioUrl: c.audioUrl,
      status: c.status,
      creatorId: c.creatorId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })
    return { data: rows.map(toAlbumPlaylist), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  },

  async getBySlugAndType(slug: string, type: ContentType) {
    const c = await prisma.content.findFirst({ where: { slug, type } })
    if (!c) return null
    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      type: c.type,
      category: c.category,
      coverUrl: c.coverUrl,
      audioUrl: c.audioUrl,
      status: c.status,
      creatorId: c.creatorId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }
  },

  async getByIdAndType(id: number, type: ContentType) {
    const c = await prisma.content.findFirst({ where: { id, type } })
    if (!c) return null
    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      type: c.type,
      category: c.category,
      coverUrl: c.coverUrl,
      audioUrl: c.audioUrl,
      status: c.status,
      creatorId: c.creatorId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }
  },
}
