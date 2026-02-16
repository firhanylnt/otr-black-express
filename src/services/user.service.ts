import { prisma } from '../lib/prisma.js'
import { toUserDto } from '../types/index.js'

const DEFAULT_LIMIT = 20
const userSelect = { id: true, email: true, username: true, displayName: true, bio: true, avatarUrl: true, role: true, isVerified: true, isSuspended: true, createdAt: true, updatedAt: true }

type UserRole = 'user' | 'admin' | 'guest_creator' | 'resident'

export const userService = {
  async list(filters: { status?: string; role?: string; search?: string; page?: number; limit?: number }) {
    const page = Number(filters.page) || 1
    const limit = Number(filters.limit) || DEFAULT_LIMIT
    const skip = (page - 1) * limit
    const where: { role?: UserRole; isSuspended?: boolean; OR?: { email?: { contains: string; mode: 'insensitive' }; username?: { contains: string; mode: 'insensitive' } }[] } = {}
    if (filters.status === 'active' || filters.status === 'suspended') {
      where.isSuspended = filters.status === 'suspended'
    } else if (filters.status) {
      where.role = filters.status as UserRole
    }
    if (filters.role) where.role = filters.role as UserRole
    if (filters.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { username: { contains: filters.search, mode: 'insensitive' } },
      ]
    }
    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])
    return {
      data: rows.map((u) => toUserDto(u)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  },

  async getById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: userSelect,
    })
    return user ? toUserDto(user) : null
  },

  async getStats() {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const [total, recentSignups, byRole] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
    ])
    return {
      total,
      recentSignups,
      thisWeek: recentSignups,
      byRole: Object.fromEntries(byRole.map((r) => [r.role, r._count.id])),
    }
  },

  async updateRole(id: number, role: UserRole) {
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: userSelect,
    })
    return toUserDto(user)
  },

  async setSuspended(id: number, suspended: boolean) {
    const user = await prisma.user.update({
      where: { id },
      data: { isSuspended: suspended },
      select: userSelect,
    })
    return toUserDto(user)
  },

  async update(id: number, data: { displayName?: string; bio?: string; avatarUrl?: string; role?: UserRole }) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.role !== undefined && { role: data.role }),
      },
      select: userSelect,
    })
    return toUserDto(user)
  },

  async delete(id: number): Promise<boolean> {
    const result = await prisma.user.deleteMany({ where: { id } })
    return result.count > 0
  },

  async listResidents(filters: { status?: string; search?: string; page?: number; limit?: number }) {
    return this.list({ ...filters, role: 'resident' })
  },

  async listCreators(filters: { status?: string; search?: string; page?: number; limit?: number }) {
    const page = Number(filters.page) || 1
    const limit = Number(filters.limit) || DEFAULT_LIMIT
    const skip = (page - 1) * limit
    const where: { role: { in: UserRole[] }; isSuspended?: boolean; OR?: { email?: { contains: string; mode: 'insensitive' }; username?: { contains: string; mode: 'insensitive' } }[] } = {
      role: { in: ['guest_creator', 'resident'] },
    }
    if (filters.status === 'active' || filters.status === 'suspended') {
      where.isSuspended = filters.status === 'suspended'
    }
    if (filters.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { username: { contains: filters.search, mode: 'insensitive' } },
      ]
    }
    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])
    return {
      data: rows.map((u) => toUserDto(u)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  },

  async promoteToResident(id: number) {
    return this.updateRole(id, 'resident')
  },

  async setRole(id: number, role: UserRole) {
    return this.updateRole(id, role)
  },

  async setResidents(creatorIds: number[]) {
    await prisma.user.updateMany({
      where: { id: { in: creatorIds } },
      data: { role: 'resident' },
    })
  },

  async demoteResident(id: number) {
    await prisma.user.updateMany({
      where: { id, role: 'resident' },
      data: { role: 'guest_creator' },
    })
    return this.getById(id)
  },
}
