import { Router } from 'express'
import { authMiddleware, adminOnly } from '../middleware/auth.js'
import { userController } from '../controllers/user.controller.js'

const router = Router()

router.get('/', authMiddleware, adminOnly, (req, res) => userController.list(req, res))
router.get('/stats', authMiddleware, adminOnly, (req, res) => userController.getStats(req, res))
router.get('/:id', authMiddleware, adminOnly, (req, res) => userController.getById(req, res))
router.patch('/:id/status', authMiddleware, adminOnly, (req, res) => userController.updateStatus(req, res))
router.patch('/:id', authMiddleware, adminOnly, (req, res) => userController.update(req, res))
router.delete('/:id', authMiddleware, adminOnly, (req, res) => userController.delete(req, res))

export default router
