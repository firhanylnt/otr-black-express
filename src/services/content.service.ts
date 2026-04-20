import { prisma } from '../lib/prisma.js'
import type { ContentType, ContentStatus } from '@prisma/client'
import type { Prisma } from '@prisma/client'

const SONG_TYPES: ContentType[] = ['track', 'album', 'mixtape']
const VALID_CONTENT_STATUSES: ContentStatus[] = ['pending', 'rejected', 'published']
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

function parseSlugs(s: string | null): string[] {
  if (!s) return []
  try {
    const a = JSON.parse(s)
    return Array.isArray(a) ? a.map(String) : []
  } catch {
    return []
  }
}

type GenreMood = { id: number; name: string; slug: string }

function resolveGenresAndTags(
  genreRows: GenreMood[],
  moodRows: GenreMood[],
  genresStr: string | null,
  tagsStr: string | null
): { genres: GenreMood[]; tags: GenreMood[] } {
  const genreBySlug = new Map(genreRows.map((g) => [g.slug, g]))
  const genreById = new Map(genreRows.map((g) => [String(g.id), g]))
  const moodBySlug = new Map(moodRows.map((m) => [m.slug, m]))
  const moodById = new Map(moodRows.map((m) => [String(m.id), m]))
  const lookupGenre = (v: string) => genreById.get(v) ?? genreBySlug.get(v)
  const lookupMood = (v: string) => moodById.get(v) ?? moodBySlug.get(v)
  const genreValues = parseSlugs(genresStr)
  const tagValues = parseSlugs(tagsStr)
  return {
    genres: genreValues.map(lookupGenre).filter(Boolean) as GenreMood[],
    tags: tagValues.map(lookupMood).filter(Boolean) as GenreMood[],
  }
}

async function enrichSongWithRelations(c: Parameters<typeof toSongDto>[0] & { creator?: { id: number; username: string; displayName: string | null; avatarUrl: string | null } | null }) {
  const [genreRows, moodRows] = await Promise.all([
    prisma.genre.findMany({ where: { isActive: 1 }, select: { id: true, name: true, slug: true } }),
    prisma.mood.findMany({ where: { isActive: 1 }, select: { id: true, name: true, slug: true } }),
  ])
  const { genres, tags } = resolveGenresAndTags(genreRows, moodRows, c.genres, c.tags)
  return {
    ...toSongDto(c),
    creator: c.creator
      ? { id: c.creator.id, username: c.creator.username, displayName: c.creator.displayName, avatarUrl: c.creator.avatarUrl }
      : null,
    genres,
    tags,
  }
}

export const contentService = {
  async listSongsPublic(filters: { genre?: string; mood?: string; search?: string; category?: string; page?: number; limit?: number }) {
    const page = Number(filters.page) || 1
    const limit = Number(filters.limit) || DEFAULT_LIMIT
    const where: Prisma.ContentWhereInput = {
      type: { in: SONG_TYPES },
      status: 'published',
    }
    if (filters.category) where.category = filters.category as any
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
    const statusStr = filters.status?.trim()
    if (statusStr && VALID_CONTENT_STATUSES.includes(statusStr as ContentStatus)) where.status = statusStr as ContentStatus
    if (filters.genre?.trim() && filters.genre !== 'undefined' && filters.genre !== 'null') where.genres = { contains: filters.genre.trim(), mode: 'insensitive' }
    const searchTerm = filters.search?.trim()
    if (searchTerm && searchTerm !== 'undefined' && searchTerm !== 'null') where.OR = [{ title: { contains: searchTerm, mode: 'insensitive' } }, { description: { contains: searchTerm, mode: 'insensitive' } }]
    const [rows, total, genreRows, moodRows] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          creator: { select: { id: true, username: true, displayName: true, avatarUrl: true, email: true } },
          reviewer: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        },
      }),
      prisma.content.count({ where }),
      prisma.genre.findMany({ where: { isActive: 1 }, select: { id: true, name: true, slug: true } }),
      prisma.mood.findMany({ where: { isActive: 1 }, select: { id: true, name: true, slug: true } }),
    ])
    const data = rows.map((c) => {
      const { genres, tags } = resolveGenresAndTags(genreRows, moodRows, c.genres, c.tags)
      return {
        ...toSongDto(c),
        creator: c.creator ? { id: c.creator.id, username: c.creator.username, displayName: c.creator.displayName, avatarUrl: c.creator.avatarUrl, email: c.creator.email } : null,
        reviewer: c.reviewer ? { id: c.reviewer.id, username: c.reviewer.username, displayName: c.reviewer.displayName, avatarUrl: c.reviewer.avatarUrl } : null,
        genres,
        tags,
      }
    })
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  },

  async listPendingSongs() {
    const [rows, genreRows, moodRows] = await Promise.all([
      prisma.content.findMany({
        where: { type: { in: SONG_TYPES }, status: 'pending' },
        orderBy: { createdAt: 'asc' },
        include: {
          creator: {
            select: { id: true, username: true, displayName: true, avatarUrl: true, email: true },
          },
          reviewer: {
            select: { id: true, username: true, displayName: true, avatarUrl: true },
          },
        },
      }),
      prisma.genre.findMany({ where: { isActive: 1 }, select: { id: true, name: true, slug: true } }),
      prisma.mood.findMany({ where: { isActive: 1 }, select: { id: true, name: true, slug: true } }),
    ])
    return rows.map((c) => {
      const { genres, tags } = resolveGenresAndTags(genreRows, moodRows, c.genres, c.tags)
      return {
        ...toSongDto(c),
        creator: c.creator ? { id: c.creator.id, username: c.creator.username, displayName: c.creator.displayName, avatarUrl: c.creator.avatarUrl, email: c.creator.email } : null,
        reviewer: c.reviewer ? { id: c.reviewer.id, username: c.reviewer.username, displayName: c.reviewer.displayName, avatarUrl: c.reviewer.avatarUrl } : null,
        genres,
        tags,
      }
    })
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
    const c = await prisma.content.findFirst({
      where: { slug, type: { in: types } },
      include: {
        creator: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
      },
    })
    if (!c) return null
    return enrichSongWithRelations(c)
  },

  async getById(id: number, types: ContentType[] = SONG_TYPES) {
    const c = await prisma.content.findFirst({
      where: { id, type: { in: types } },
      include: {
        creator: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
      },
    })
    if (!c) return null
    return enrichSongWithRelations(c)
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
      data: { status: 'published', reviewedBy, reviewedAt: new Date() },
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
      data: { status: 'pending' },
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
    const contentId = Number(id)
    if (!Number.isFinite(contentId) || contentId < 1) return null
    await prisma.content.update({
      where: { id: contentId },
      data: { plays: { increment: 1 } },
    })
    return this.getById(contentId)
  },

  async delete(id: number): Promise<boolean> {
    const contentId = Number(id)
    if (!Number.isFinite(contentId) || contentId < 1) return false
    await prisma.playHistory.deleteMany({ where: { contentId } })
    const result = await prisma.content.deleteMany({ where: { id: contentId } })
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
