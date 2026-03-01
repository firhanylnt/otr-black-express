import type { Request, Response } from 'express'
import { userService } from '../services/user.service.js'

export const userController = {
  async list(req: Request, res: Response): Promise<void> {
    const { status, search, page, limit, role } = req.query
    const searchStr = typeof search === 'string' && search && search !== 'undefined' && search !== 'null' ? search : undefined
    const result = await userService.list({
      status: (status as string) && (status as string) !== 'undefined' ? (status as string) : undefined,
      role: (role as string) && (role as string) !== 'undefined' ? (role as string) : undefined,
      search: searchStr,
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

  async getStats(req: Request, res: Response): Promise<void> {
    const data = await userService.getStats()
    res.json({ success: true, data })
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
    const user = await userService.updateRole(id, status as 'user' | 'admin' | 'guest_creator' | 'resident')
    res.json({ success: true, data: user })
  },

  async update(req: Request, res: Response): Promise<void> {
    const b = req.body as { display_name?: string; bio?: string; avatar_url?: string; role?: string }
    const data = {
      displayName: b.display_name,
      bio: b.bio,
      avatarUrl: b.avatar_url,
      role: b.role as 'user' | 'admin' | 'guest_creator' | 'resident' | undefined,
    }
    const user = await userService.update(Number(req.params.id), data)
    res.json({ success: true, data: user })
  },

  async delete(req: Request, res: Response): Promise<void> {
    const deleted = await userService.delete(Number(req.params.id))
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Not found' })
      return
    }
    res.json({ success: true })
  },
}
