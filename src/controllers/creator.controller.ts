import type { Request, Response } from 'express'
import { userService } from '../services/user.service.js'

export const creatorController = {
  async list(req: Request, res: Response): Promise<void> {
    const { status, search, genre, page, limit } = req.query
    const result = await userService.listCreators({
      status: status as string | undefined,
      search: search as string | undefined,
      genre: genre as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
    res.json({ success: true, ...result })
  },

  async getById(req: Request, res: Response): Promise<void> {
    const user = await userService.getById(Number(req.params.id))
    if (!user) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: user })
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    const status = (req.body as { status?: string }).status
    if (!status) {
      res.status(400).json({ success: false, message: 'status required' })
      return
    }
    const id = Number(req.params.id)
    if (status === 'active' || status === 'suspended' || status === 'inactive') {
      const user = await userService.setSuspended(id, status === 'suspended' || status === 'inactive')
      res.json({ success: true, data: user })
      return
    }
    const user = await userService.setRole(id, status as 'user' | 'admin' | 'guest_creator' | 'resident')
    res.json({ success: true, data: user })
  },

  async upgrade(req: Request, res: Response): Promise<void> {
    const user = await userService.promoteToResident(Number(req.params.id))
    res.json({ success: true, data: user })
  },
}
