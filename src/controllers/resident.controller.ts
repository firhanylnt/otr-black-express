import type { Request, Response } from 'express'
import { userService } from '../services/user.service.js'

export const residentController = {
  async list(req: Request, res: Response): Promise<void> {
    const { status, search, page, limit } = req.query
    const result = await userService.listResidents({
      status: status as string | undefined,
      search: search as string | undefined,
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

  async setResidents(req: Request, res: Response): Promise<void> {
    const { creatorIds } = req.body as { creatorIds: string[] }
    if (!Array.isArray(creatorIds)) {
      res.status(400).json({ success: false, message: 'creatorIds array required' })
      return
    }
    await userService.setResidents(creatorIds.map(Number))
    res.status(201).json({ success: true })
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    const status = (req.body as { status?: string }).status
    if (!status) {
      res.status(400).json({ success: false, message: 'status required' })
      return
    }
    const user = await userService.setRole(Number(req.params.id), status as 'user' | 'admin' | 'guest_creator' | 'resident')
    res.json({ success: true, data: user })
  },

  async demote(req: Request, res: Response): Promise<void> {
    const user = await userService.demoteResident(Number(req.params.id))
    if (!user) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true, data: user })
  },
}
