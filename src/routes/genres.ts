import { Router } from 'express'
import { authMiddleware, adminOnly } from '../middleware/auth.js'
import { genreController } from '../controllers/genre.controller.js'

const router = Router()

router.get('/', (req, res) => genreController.list(req, res))
router.get('/slug/:slug', (req, res) => genreController.getBySlug(req, res))
router.get('/:id', (req, res) => genreController.getById(req, res))
router.post('/', authMiddleware, adminOnly, (req, res) => genreController.create(req, res))
router.patch('/:id', authMiddleware, adminOnly, (req, res) => genreController.update(req, res))
router.patch('/:id/toggle', authMiddleware, adminOnly, (req, res) => genreController.toggle(req, res))
router.delete('/:id', authMiddleware, adminOnly, (req, res) => genreController.delete(req, res))

export default router
