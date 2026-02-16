import { prisma } from '../lib/prisma.js'
import type { SubscriberStatus } from '@prisma/client'

const DEFAULT_LIMIT = 20

export const subscriberService = {
  async subscribe(email: string, name?: string | null, source?: string | null) {
    try {
      await prisma.subscriber.create({
        data: { email, name: name ?? null, source: source ?? null, status: 'active' },
      })
      return 'created'
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : ''
      if (msg.includes('Unique') || msg.includes('unique')) {
        await prisma.subscriber.updateMany({
          where: { email },
          data: { status: 'active', name: name ?? undefined, source: source ?? undefined },
        })
        return 'resubscribed'
      }
      throw e
    }
  },

  async unsubscribe(email: string) {
    await prisma.subscriber.updateMany({
      where: { email },
      data: { status: 'unsubscribed' },
    })
  },

  async list(filters: { status?: string; search?: string; page?: number; limit?: number }) {
    const page = Number(filters.page) || 1
    const limit = Number(filters.limit) || DEFAULT_LIMIT
    const where: { status?: SubscriberStatus; OR?: { email?: { contains: string; mode: 'insensitive' }; name?: { contains: string; mode: 'insensitive' } }[] } = {}
    if (filters.status) where.status = filters.status as SubscriberStatus
    if (filters.search) where.OR = [{ email: { contains: filters.search, mode: 'insensitive' } }, { name: { contains: filters.search, mode: 'insensitive' } }]
    const [rows, total] = await Promise.all([
      prisma.subscriber.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.subscriber.count({ where }),
    ])
    return { data: rows, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  },

  async getStats() {
    const [total, active] = await Promise.all([
      prisma.subscriber.count(),
      prisma.subscriber.count({ where: { status: 'active' } }),
    ])
    return { total, active }
  },

  async delete(id: number): Promise<boolean> {
    const result = await prisma.subscriber.deleteMany({ where: { id } })
    return result.count > 0
  },
}
