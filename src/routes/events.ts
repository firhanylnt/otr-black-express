import { Router } from 'express'
import { authMiddleware, adminOnly } from '../middleware/auth.js'
import { eventUpload } from '../middleware/upload.js'
import { eventController } from '../controllers/event.controller.js'

const router = Router()

router.get('/', (req, res) => eventController.list(req, res))
router.get('/upcoming', (req, res) => eventController.listUpcoming(req, res))
router.get('/past', (req, res) => eventController.listPast(req, res))
router.get('/slug/:slug', (req, res) => eventController.getBySlug(req, res))
router.get('/:id', (req, res) => eventController.getById(req, res))
router.post('/', authMiddleware, adminOnly, eventUpload, (req, res) => eventController.create(req, res))
router.patch('/:id', authMiddleware, adminOnly, eventUpload, (req, res) => eventController.update(req, res))
router.delete('/:id', authMiddleware, adminOnly, (req, res) => eventController.delete(req, res))

export default router
