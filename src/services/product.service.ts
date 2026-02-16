import { prisma } from '../lib/prisma.js'
import type { ProductCategory } from '@prisma/client'

function toDto(p: { id: number; name: string; slug: string; description: string | null; price: number; currency: string; imageUrl: string | null; images: string | null; category: string; stock: number; isAvailable: number; createdAt: Date }) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    currency: p.currency,
    imageUrl: p.imageUrl,
    images: p.images ? JSON.parse(p.images) : [],
    category: p.category,
    stock: p.stock,
    isAvailable: Boolean(p.isAvailable),
    createdAt: p.createdAt,
  }
}

export const productService = {
  async list(includeInactive = false) {
    const rows = await prisma.product.findMany({
      where: includeInactive ? undefined : { isAvailable: 1 },
      orderBy: { name: 'asc' },
    })
    return rows.map(toDto)
  },

  async getById(id: number) {
    const p = await prisma.product.findUnique({ where: { id } })
    return p ? toDto(p) : null
  },

  async create(data: { name: string; slug?: string; description?: string | null; price: number; currency?: string; imageUrl?: string | null; images?: string | null; category?: ProductCategory; stock?: number; isAvailable?: boolean }) {
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const p = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description ?? null,
        price: data.price,
        currency: data.currency ?? 'USD',
        imageUrl: data.imageUrl ?? null,
        images: data.images ?? null,
        category: data.category ?? 'other',
        stock: data.stock ?? 0,
        isAvailable: data.isAvailable !== false ? 1 : 0,
      },
    })
    return toDto(p)
  },

  async update(id: number, data: Partial<{ name: string; description: string; price: number; currency: string; imageUrl: string; images: string; category: ProductCategory; stock: number; isAvailable: boolean }>) {
    const p = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.images !== undefined && { images: typeof data.images === 'string' ? data.images : JSON.stringify(data.images) }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable ? 1 : 0 }),
      },
    })
    return toDto(p)
  },

  async delete(id: number): Promise<boolean> {
    const result = await prisma.product.deleteMany({ where: { id } })
    return result.count > 0
  },
}
