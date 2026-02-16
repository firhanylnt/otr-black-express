import { Router } from 'express'
import { authMiddleware, adminOnly } from '../middleware/auth.js'
import { moodController } from '../controllers/mood.controller.js'

const router = Router()

router.get('/', (req, res) => moodController.list(req, res))
router.get('/slug/:slug', (req, res) => moodController.getBySlug(req, res))
router.get('/:id', (req, res) => moodController.getById(req, res))
router.post('/', authMiddleware, adminOnly, (req, res) => moodController.create(req, res))
router.patch('/:id', authMiddleware, adminOnly, (req, res) => moodController.update(req, res))
router.patch('/:id/toggle', authMiddleware, adminOnly, (req, res) => moodController.toggle(req, res))
router.delete('/:id', authMiddleware, adminOnly, (req, res) => moodController.delete(req, res))

export default router
