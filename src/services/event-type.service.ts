import { prisma } from '../lib/prisma.js'

function toDto(et: { id: number; name: string; slug: string; sortOrder: number; isActive: number; createdAt: Date; updatedAt: Date }) {
  return {
    id: et.id,
    name: et.name,
    slug: et.slug,
    sortOrder: et.sortOrder,
    isActive: Boolean(et.isActive),
    createdAt: et.createdAt,
    updatedAt: et.updatedAt,
  }
}

export const eventTypeService = {
  async list(includeInactive = false) {
    const rows = await prisma.eventType.findMany({
      where: includeInactive ? undefined : { isActive: 1 },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })
    return rows.map(toDto)
  },

  async getBySlug(slug: string) {
    const et = await prisma.eventType.findUnique({ where: { slug } })
    return et ? toDto(et) : null
  },

  async getById(id: number) {
    const et = await prisma.eventType.findUnique({ where: { id } })
    return et ? toDto(et) : null
  },

  async create(data: { name: string; slug?: string; sortOrder?: number }) {
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const et = await prisma.eventType.create({
      data: {
        name: data.name,
        slug,
        sortOrder: data.sortOrder ?? 0,
      },
    })
    return toDto(et)
  },

  async update(id: number, data: { name?: string; slug?: string; sortOrder?: number; isActive?: boolean }) {
    const et = await prisma.eventType.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.isActive !== undefined && { isActive: data.isActive ? 1 : 0 }),
      },
    })
    return toDto(et)
  },

  async toggle(id: number) {
    const et = await prisma.eventType.findUnique({ where: { id } })
    if (!et) return null
    const updated = await prisma.eventType.update({
      where: { id },
      data: { isActive: et.isActive === 1 ? 0 : 1 },
    })
    return toDto(updated)
  },

  async delete(id: number): Promise<boolean> {
    const result = await prisma.eventType.deleteMany({ where: { id } })
    return result.count > 0
  },
}
