import { prisma } from '../lib/prisma.js'
import type { HighlightPosition } from '@prisma/client'

function toDto(h: { id: number; position: string; sideIndex: number | null; title: string; artist: string | null; image: string | null; customImage: string | null; tag: string | null; type: string | null; link: string | null; active: number; sortOrder: number; createdAt: Date; updatedAt: Date }) {
  return {
    id: h.id,
    position: h.position,
    sideIndex: h.sideIndex,
    title: h.title,
    artist: h.artist,
    image: h.image,
    customImage: h.customImage,
    tag: h.tag,
    type: h.type,
    link: h.link,
    active: Boolean(h.active),
    sortOrder: h.sortOrder,
    createdAt: h.createdAt,
    updatedAt: h.updatedAt,
  }
}

export const highlightService = {
  async list(activeOnly = true) {
    const rows = await prisma.highlight.findMany({
      where: activeOnly ? { active: 1 } : undefined,
      orderBy: [{ position: 'asc' }, { sideIndex: 'asc' }, { sortOrder: 'asc' }],
    })
    return rows.map(toDto)
  },

  async getById(id: number) {
    const h = await prisma.highlight.findUnique({ where: { id } })
    return h ? toDto(h) : null
  },

  async create(data: { position?: HighlightPosition; sideIndex?: number | null; title: string; artist?: string | null; image?: string | null; customImage?: string | null; tag?: string | null; type?: string | null; link?: string | null; active?: boolean; sortOrder?: number }) {
    const h = await prisma.highlight.create({
      data: {
        position: data.position ?? 'main',
        sideIndex: data.sideIndex ?? null,
        title: data.title ?? '',
        artist: data.artist ?? null,
        image: data.image ?? null,
        customImage: data.customImage ?? null,
        tag: data.tag ?? null,
        type: data.type ?? null,
        link: data.link ?? null,
        active: data.active !== false ? 1 : 0,
        sortOrder: data.sortOrder ?? 0,
      },
    })
    return toDto(h)
  },

  async update(id: number, data: Partial<{ position: HighlightPosition; sideIndex: number; title: string; artist: string; image: string; customImage: string; tag: string; type: string; link: string; active: boolean; sortOrder: number }>) {
    const h = await prisma.highlight.update({
      where: { id },
      data: {
        ...(data.position !== undefined && { position: data.position }),
        ...(data.sideIndex !== undefined && { sideIndex: data.sideIndex }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.artist !== undefined && { artist: data.artist }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.customImage !== undefined && { customImage: data.customImage }),
        ...(data.tag !== undefined && { tag: data.tag }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.link !== undefined && { link: data.link }),
        ...(data.active !== undefined && { active: data.active ? 1 : 0 }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    })
    return toDto(h)
  },

  async toggle(id: number) {
    const h = await prisma.highlight.findUnique({ where: { id } })
    if (!h) return null
    const updated = await prisma.highlight.update({
      where: { id },
      data: { active: h.active === 1 ? 0 : 1 },
    })
    return toDto(updated)
  },

  async delete(id: number): Promise<boolean> {
    const result = await prisma.highlight.deleteMany({ where: { id } })
    return result.count > 0
  },
}
