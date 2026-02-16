import { Router } from 'express'
import { authMiddleware, adminOnly } from '../middleware/auth.js'
import { pickController } from '../controllers/pick.controller.js'

const router = Router()

router.get('/', (req, res) => pickController.list(req, res))
router.get('/:id', (req, res) => pickController.getById(req, res))
router.post('/', authMiddleware, adminOnly, (req, res) => pickController.create(req, res))
router.patch('/:id', authMiddleware, adminOnly, (req, res) => pickController.update(req, res))
router.delete('/:id', authMiddleware, adminOnly, (req, res) => pickController.delete(req, res))

export default router
