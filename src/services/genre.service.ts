import { prisma } from '../lib/prisma.js'

function toDto(g: { id: number; name: string; slug: string; isActive: number; createdAt: Date }) {
  return { id: g.id, name: g.name, slug: g.slug, isActive: Boolean(g.isActive), createdAt: g.createdAt }
}

export const genreService = {
  async list(includeInactive = false) {
    const rows = await prisma.genre.findMany({
      where: includeInactive ? undefined : { isActive: 1 },
      orderBy: { name: 'asc' },
    })
    return rows.map(toDto)
  },

  async getBySlug(slug: string) {
    const g = await prisma.genre.findUnique({ where: { slug } })
    return g ? toDto(g) : null
  },

  async getById(id: number) {
    const g = await prisma.genre.findUnique({ where: { id } })
    return g ? toDto(g) : null
  },

  async create(data: { name: string; slug?: string }) {
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const g = await prisma.genre.create({ data: { name: data.name, slug } })
    return toDto(g)
  },

  async update(id: number, data: { name?: string; slug?: string }) {
    const g = await prisma.genre.update({
      where: { id },
      data: { ...(data.name !== undefined && { name: data.name }), ...(data.slug !== undefined && { slug: data.slug }) },
    })
    return toDto(g)
  },

  async toggle(id: number) {
    const g = await prisma.genre.findUnique({ where: { id } })
    if (!g) return null
    const updated = await prisma.genre.update({
      where: { id },
      data: { isActive: g.isActive === 1 ? 0 : 1 },
    })
    return toDto(updated)
  },

  async delete(id: number): Promise<boolean> {
    const result = await prisma.genre.deleteMany({ where: { id } })
    return result.count > 0
  },
}
