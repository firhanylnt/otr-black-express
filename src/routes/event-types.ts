import { Router } from 'express'
import { authMiddleware, adminOnly } from '../middleware/auth.js'
import { eventTypeController } from '../controllers/event-type.controller.js'

const router = Router()

router.get('/', (req, res) => eventTypeController.list(req, res))
router.get('/slug/:slug', (req, res) => eventTypeController.getBySlug(req, res))
router.get('/:id', (req, res) => eventTypeController.getById(req, res))
router.post('/', authMiddleware, adminOnly, (req, res) => eventTypeController.create(req, res))
router.patch('/:id', authMiddleware, adminOnly, (req, res) => eventTypeController.update(req, res))
router.patch('/:id/toggle', authMiddleware, adminOnly, (req, res) => eventTypeController.toggle(req, res))
router.delete('/:id', authMiddleware, adminOnly, (req, res) => eventTypeController.delete(req, res))

export default router
