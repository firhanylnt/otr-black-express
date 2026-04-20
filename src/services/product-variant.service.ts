import { prisma } from '../lib/prisma.js'

function toDto(v: { id: number; productId: number; name: string; value: string; priceModifier: number; stock: number }) {
  return { id: v.id, productId: v.productId, name: v.name, value: v.value, priceModifier: v.priceModifier, stock: v.stock }
}

export const productVariantService = {
  async listByProduct(productId: number) {
    const rows = await prisma.productVariant.findMany({ where: { productId }, orderBy: { id: 'asc' } })
    return rows.map(toDto)
  },

  async getById(id: number) {
    const v = await prisma.productVariant.findUnique({ where: { id } })
    return v ? toDto(v) : null
  },

  async create(productId: number, data: { name: string; value: string; priceModifier?: number; stock?: number }) {
    const v = await prisma.productVariant.create({
      data: { productId, name: data.name, value: data.value, priceModifier: data.priceModifier ?? 0, stock: data.stock ?? 0 },
    })
    return toDto(v)
  },

  async update(id: number, data: Partial<{ name: string; value: string; priceModifier: number; stock: number }>) {
    const v = await prisma.productVariant.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.priceModifier !== undefined && { priceModifier: data.priceModifier }),
        ...(data.stock !== undefined && { stock: data.stock }),
      },
    })
    return toDto(v)
  },

  async delete(id: number): Promise<boolean> {
    const result = await prisma.productVariant.deleteMany({ where: { id } })
    return result.count > 0
  },
}
