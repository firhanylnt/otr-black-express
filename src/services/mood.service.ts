import { prisma } from '../lib/prisma.js'

function toDto(m: { id: number; name: string; slug: string; isActive: number; createdAt: Date }) {
  return { id: m.id, name: m.name, slug: m.slug, isActive: Boolean(m.isActive), createdAt: m.createdAt }
}

export const moodService = {
  async list(includeInactive = false) {
    const rows = await prisma.mood.findMany({
      where: includeInactive ? undefined : { isActive: 1 },
      orderBy: { name: 'asc' },
    })
    return rows.map(toDto)
  },

  async getBySlug(slug: string) {
    const m = await prisma.mood.findUnique({ where: { slug } })
    return m ? toDto(m) : null
  },

  async getById(id: number) {
    const m = await prisma.mood.findUnique({ where: { id } })
    return m ? toDto(m) : null
  },

  async create(data: { name: string; slug?: string }) {
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const m = await prisma.mood.create({ data: { name: data.name, slug } })
    return toDto(m)
  },

  async update(id: number, data: { name?: string; slug?: string }) {
    const m = await prisma.mood.update({
      where: { id },
      data: { ...(data.name !== undefined && { name: data.name }), ...(data.slug !== undefined && { slug: data.slug }) },
    })
    return toDto(m)
  },

  async toggle(id: number) {
    const m = await prisma.mood.findUnique({ where: { id } })
    if (!m) return null
    const updated = await prisma.mood.update({
      where: { id },
      data: { isActive: m.isActive === 1 ? 0 : 1 },
    })
    return toDto(updated)
  },

  async delete(id: number): Promise<boolean> {
    const result = await prisma.mood.deleteMany({ where: { id } })
    return result.count > 0
  },
}
