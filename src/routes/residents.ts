import { Router } from 'express'
import { authMiddleware, adminOnly } from '../middleware/auth.js'
import { residentController } from '../controllers/resident.controller.js'

const router = Router()

router.get('/', (req, res) => residentController.list(req, res))
router.get('/:id', (req, res) => residentController.getById(req, res))
router.post('/', authMiddleware, adminOnly, (req, res) => residentController.setResidents(req, res))
router.patch('/:id/status', authMiddleware, adminOnly, (req, res) => residentController.updateStatus(req, res))
router.delete('/:id', authMiddleware, adminOnly, (req, res) => residentController.demote(req, res))

export default router
