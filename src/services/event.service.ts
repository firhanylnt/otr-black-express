import { prisma } from '../lib/prisma.js'
import type { EventStatus } from '@prisma/client'

const DEFAULT_LIMIT = 20

function toEventDto(e: { id: number; title: string; slug: string; description: string | null; coverUrl: string | null; bannerUrl: string | null; venue: string | null; address: string | null; city: string | null; country: string | null; startDate: string; endDate: string | null; ticketUrl: string | null; price: string | null; isFree: number; status: string; createdAt: Date }) {
  return {
    id: e.id,
    title: e.title,
    slug: e.slug,
    description: e.description,
    coverUrl: e.coverUrl,
    bannerUrl: e.bannerUrl,
    venue: e.venue,
    address: e.address,
    city: e.city,
    country: e.country,
    startDate: e.startDate,
    endDate: e.endDate,
    ticketUrl: e.ticketUrl,
    price: e.price,
    isFree: Boolean(e.isFree),
    status: e.status,
    createdAt: e.createdAt,
  }
}

export const eventService = {
  async list(filters: { status?: string; search?: string; page?: number; limit?: number }) {
    const page = Number(filters.page) || 1
    const limit = Number(filters.limit) || DEFAULT_LIMIT
    const where: { status?: EventStatus; OR?: { title?: { contains: string; mode: 'insensitive' }; description?: { contains: string; mode: 'insensitive' } }[] } = {}
    if (filters.status) where.status = filters.status as EventStatus
    if (filters.search) where.OR = [{ title: { contains: filters.search, mode: 'insensitive' } }, { description: { contains: filters.search, mode: 'insensitive' } }]
    const [rows, total] = await Promise.all([
      prisma.event.findMany({ where, orderBy: { startDate: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.event.count({ where }),
    ])
    return { data: rows.map(toEventDto), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  },

  async listUpcoming() {
    const rows = await prisma.event.findMany({
      where: { status: 'upcoming' },
      orderBy: { startDate: 'asc' },
    })
    return rows.map(toEventDto)
  },

  async listPast(limit = 10) {
    const rows = await prisma.event.findMany({
      where: { status: 'past' },
      orderBy: { startDate: 'desc' },
      take: limit,
    })
    return rows.map(toEventDto)
  },

  async getBySlug(slug: string) {
    const e = await prisma.event.findUnique({ where: { slug } })
    return e ? toEventDto(e) : null
  },

  async getById(id: number) {
    const e = await prisma.event.findUnique({ where: { id } })
    return e ? toEventDto(e) : null
  },

  async create(data: { title: string; slug: string; description?: string | null; coverUrl?: string | null; bannerUrl?: string | null; venue?: string | null; address?: string | null; city?: string | null; country?: string | null; startDate?: string | null; endDate?: string | null; ticketUrl?: string | null; price?: string | null; isFree?: boolean; status?: EventStatus }) {
    const e = await prisma.event.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description ?? null,
        coverUrl: data.coverUrl ?? null,
        bannerUrl: data.bannerUrl ?? null,
        venue: data.venue ?? null,
        address: data.address ?? null,
        city: data.city ?? null,
        country: data.country ?? null,
        startDate: data.startDate ?? '',
        endDate: data.endDate ?? null,
        ticketUrl: data.ticketUrl ?? null,
        price: data.price ?? null,
        isFree: data.isFree ? 1 : 0,
        status: data.status ?? 'upcoming',
      },
    })
    return toEventDto(e)
  },

  async update(id: number, data: Partial<{ title: string; description: string; coverUrl: string; bannerUrl: string; venue: string; address: string; city: string; country: string; startDate: string; endDate: string; ticketUrl: string; price: string; isFree: boolean; status: EventStatus }>) {
    const e = await prisma.event.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.coverUrl !== undefined && { coverUrl: data.coverUrl }),
        ...(data.bannerUrl !== undefined && { bannerUrl: data.bannerUrl }),
        ...(data.venue !== undefined && { venue: data.venue }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.country !== undefined && { country: data.country }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.ticketUrl !== undefined && { ticketUrl: data.ticketUrl }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.isFree !== undefined && { isFree: data.isFree ? 1 : 0 }),
        ...(data.status !== undefined && { status: data.status }),
      },
    })
    return toEventDto(e)
  },

  async delete(id: number): Promise<boolean> {
    const result = await prisma.event.deleteMany({ where: { id } })
    return result.count > 0
  },
}
