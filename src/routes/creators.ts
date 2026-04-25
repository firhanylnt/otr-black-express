import { Router } from 'express'
import { authMiddleware, adminOnly } from '../middleware/auth.js'
import { creatorController } from '../controllers/creator.controller.js'

const router = Router()

router.get('/', (req, res) => creatorController.list(req, res))
router.get('/:id', (req, res) => creatorController.getById(req, res))
router.patch('/:id/status', authMiddleware, adminOnly, (req, res) => creatorController.updateStatus(req, res))
router.patch('/:id/upgrade', authMiddleware, adminOnly, (req, res) => creatorController.upgrade(req, res))

export default router
