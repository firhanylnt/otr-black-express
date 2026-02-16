import { prisma } from '../lib/prisma.js'

const DEFAULT_LIMIT = 20

function toDto(p: { id: number; contentType: string; contentId: number; curatorNote: string | null; sortOrder: number; isActive: number; createdAt: Date }) {
  return { id: p.id, contentType: p.contentType, contentId: p.contentId, curatorNote: p.curatorNote, sortOrder: p.sortOrder, isActive: Boolean(p.isActive), createdAt: p.createdAt }
}

export const pickService = {
  async list(filters: { type?: string; page?: number; limit?: number }) {
    const page = Number(filters.page) || 1
    const limit = Number(filters.limit) || DEFAULT_LIMIT
    const where: { isActive: number; contentType?: string } = { isActive: 1 }
    if (filters.type) where.contentType = filters.type
    const [rows, total] = await Promise.all([
      prisma.pick.findMany({ where, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }], skip: (page - 1) * limit, take: limit }),
      prisma.pick.count({ where }),
    ])
    return { data: rows.map(toDto), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  },

  async getById(id: number) {
    const p = await prisma.pick.findUnique({ where: { id } })
    return p ? toDto(p) : null
  },

  async create(data: { contentType: string; contentId: number; curatorNote?: string | null }) {
    const p = await prisma.pick.create({
      data: { contentType: data.contentType, contentId: data.contentId, curatorNote: data.curatorNote ?? null },
    })
    return toDto(p)
  },

  async update(id: number, data: { curatorNote?: string; sortOrder?: number; isActive?: boolean }) {
    const p = await prisma.pick.update({
      where: { id },
      data: {
        ...(data.curatorNote !== undefined && { curatorNote: data.curatorNote }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.isActive !== undefined && { isActive: data.isActive ? 1 : 0 }),
      },
    })
    return toDto(p)
  },

  async delete(id: number): Promise<boolean> {
    const result = await prisma.pick.deleteMany({ where: { id } })
    return result.count > 0
  },
}
