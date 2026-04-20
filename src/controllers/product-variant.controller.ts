import type { Request, Response } from 'express'
import { productVariantService } from '../services/product-variant.service.js'

export const productVariantController = {
  async list(req: Request, res: Response): Promise<void> {
    const productId = Number(req.params.productId)
    const data = await productVariantService.listByProduct(productId)
    res.json({ success: true, data })
  },

  async getById(req: Request, res: Response): Promise<void> {
    const v = await productVariantService.getById(Number(req.params.variantId))
    if (!v) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: v })
  },

  async create(req: Request, res: Response): Promise<void> {
    const productId = Number(req.params.productId)
    const b = req.body as { name: string; value: string; priceModifier?: number; stock?: number }
    if (!b.name || !b.value) {
      res.status(400).json({ success: false, message: 'name and value are required' })
      return
    }
    const v = await productVariantService.create(productId, b)
    res.status(201).json({ success: true, data: v })
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.variantId)
    const existing = await productVariantService.getById(id)
    if (!existing) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    const b = req.body as Partial<{ name: string; value: string; priceModifier: number; stock: number }>
    const v = await productVariantService.update(id, b)
    res.json({ success: true, data: v })
  },

  async delete(req: Request, res: Response): Promise<void> {
    const deleted = await productVariantService.delete(Number(req.params.variantId))
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true })
  },
}
