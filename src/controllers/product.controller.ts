import type { Request, Response } from 'express'
import { productService } from '../services/product.service.js'
import { uploadFileToR2 } from '../services/r2.js'
import { isR2Configured } from '../config.js'

function getFile(req: Request, field: string): Express.Multer.File | undefined {
  const files = (req as Request & { files?: Record<string, Express.Multer.File[]> }).files
  return files?.[field]?.[0]
}

export const productController = {
  async list(req: Request, res: Response): Promise<void> {
    const includeInactive = req.query.includeInactive === 'true'
    const data = await productService.list(includeInactive)
    res.json({ success: true, data })
  },

  async getById(req: Request, res: Response): Promise<void> {
    const product = await productService.getById(Number(req.params.id))
    if (!product) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: product })
  },

  async create(req: Request, res: Response): Promise<void> {
    const b = req.body as Record<string, unknown>
    const image = getFile(req, 'image')
    if (image && !isR2Configured()) {
      res.status(503).json({ success: false, message: 'Upload service not configured' })
      return
    }
    let imageUrl = (b.imageUrl as string) ?? null
    if (image) {
      try {
        imageUrl = await uploadFileToR2(image, 'images')
      } catch (e) {
        res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Upload failed' })
        return
      }
    }
    const product = await productService.create({
      name: String(b.name ?? ''),
      slug: b.slug as string | undefined,
      description: (b.description as string) ?? null,
      price: Number(b.price) ?? 0,
      currency: (b.currency as string) ?? 'USD',
      imageUrl,
      images: b.images != null ? (Array.isArray(b.images) ? JSON.stringify(b.images) : String(b.images)) : null,
      category: (b.category as 'apparel' | 'vinyl' | 'prints' | 'accessories' | 'other') ?? 'other',
      stock: b.stock != null ? Number(b.stock) : 0,
      isAvailable: b.isAvailable !== false,
    })
    res.status(201).json({ success: true, data: product })
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id)
    const existing = await productService.getById(id)
    if (!existing) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    const b = req.body as Record<string, unknown>
    const image = getFile(req, 'image')
    if (image && !isR2Configured()) {
      res.status(503).json({ success: false, message: 'Upload service not configured' })
      return
    }
    if (image) {
      try {
        b.imageUrl = await uploadFileToR2(image, 'images')
      } catch (e) {
        res.status(400).json({ success: false, message: e instanceof Error ? e.message : 'Upload failed' })
        return
      }
    }
    const product = await productService.update(id, {
      name: b.name as string,
      description: b.description as string,
      price: b.price as number,
      currency: b.currency as string,
      imageUrl: b.imageUrl as string,
      images: b.images != null ? (Array.isArray(b.images) ? JSON.stringify(b.images) : (b.images as string)) : undefined,
      category: b.category as 'apparel' | 'vinyl' | 'prints' | 'accessories' | 'other',
      stock: b.stock as number,
      isAvailable: b.isAvailable as boolean,
    })
    res.json({ success: true, data: product })
  },

  async delete(req: Request, res: Response): Promise<void> {
    const deleted = await productService.delete(Number(req.params.id))
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true })
  },
}
