import { Router } from 'express'
import { authMiddleware, adminOnly } from '../middleware/auth.js'
import { coverUpload } from '../middleware/upload.js'
import { albumController } from '../controllers/album.controller.js'

const router = Router()

router.get('/', (req, res) => albumController.list(req, res))
router.get('/slug/:slug', (req, res) => albumController.getBySlug(req, res))
router.get('/:id', (req, res) => albumController.getById(req, res))
router.post('/', authMiddleware, adminOnly, coverUpload, (req, res) => albumController.create(req, res))
router.patch('/:id', authMiddleware, adminOnly, coverUpload, (req, res) => albumController.update(req, res))
router.delete('/:id', authMiddleware, adminOnly, (req, res) => albumController.delete(req, res))

export default router
