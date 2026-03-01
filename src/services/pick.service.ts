import { prisma } from '../lib/prisma.js'

const DEFAULT_LIMIT = 20

const contentSelect = {
  id: true,
  title: true,
  slug: true,
  type: true,
  category: true,
  coverUrl: true,
  audioUrl: true,
  duration: true,
  status: true,
  creatorId: true,
  plays: true,
  likes: true,
  createdAt: true,
  creator: {
    select: { id: true, username: true, displayName: true, avatarUrl: true },
  },
} as const

type PickWithContent = {
  id: number
  contentType: string
  contentId: number
  curatorNote: string | null
  sortOrder: number
  isActive: number
  createdAt: Date
  content: {
    id: number
    title: string
    slug: string
    type: string
    category: string
    coverUrl: string | null
    audioUrl: string | null
    duration: number | null
    status: string
    creatorId: number | null
    plays: number
    likes: number
    createdAt: Date
    creator: { id: number; username: string; displayName: string | null; avatarUrl: string | null } | null
  } | null
}

function toDto(p: PickWithContent) {
  return {
    id: p.id,
    contentType: p.contentType,
    contentId: p.contentId,
    curatorNote: p.curatorNote,
    sortOrder: p.sortOrder,
    isActive: Boolean(p.isActive),
    createdAt: p.createdAt,
    content: p.content
      ? {
          id: p.content.id,
          title: p.content.title,
          slug: p.content.slug,
          type: p.content.type,
          category: p.content.category,
          coverUrl: p.content.coverUrl,
          audioUrl: p.content.audioUrl,
          duration: p.content.duration,
          status: p.content.status,
          creatorId: p.content.creatorId,
          plays: p.content.plays,
          likes: p.content.likes,
          createdAt: p.content.createdAt,
          creator: p.content.creator,
        }
      : null,
  }
}

export const pickService = {
  async list(filters: { type?: string; page?: number; limit?: number }) {
    const page = Number(filters.page) || 1
    const limit = Number(filters.limit) || DEFAULT_LIMIT
    const where: { isActive: number; contentType?: string } = { isActive: 1 }
    if (filters.type) where.contentType = filters.type
    const [rows, total] = await Promise.all([
      prisma.pick.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: { content: { select: contentSelect } },
      }),
      prisma.pick.count({ where }),
    ])
    return { data: rows.map(toDto), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  },

  async getById(id: number) {
    const p = await prisma.pick.findUnique({
      where: { id },
      include: { content: { select: contentSelect } },
    })
    return p ? toDto(p as PickWithContent) : null
  },

  async create(data: { contentType: string; contentId: number; curatorNote?: string | null }) {
    const p = await prisma.pick.create({
      data: { contentType: data.contentType, contentId: data.contentId, curatorNote: data.curatorNote ?? null },
    })
    return this.getById(p.id)
  },

  async update(id: number, data: { curatorNote?: string; sortOrder?: number; isActive?: boolean }) {
    await prisma.pick.update({
      where: { id },
      data: {
        ...(data.curatorNote !== undefined && { curatorNote: data.curatorNote }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.isActive !== undefined && { isActive: data.isActive ? 1 : 0 }),
      },
    })
    return this.getById(id)
  },

  async delete(id: number): Promise<boolean> {
    const result = await prisma.pick.deleteMany({ where: { id } })
    return result.count > 0
  },
}
