import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { coverUpload } from '../middleware/upload.js'
import { playlistController } from '../controllers/playlist.controller.js'

const router = Router()

router.get('/', (req, res) => playlistController.list(req, res))
router.get('/:id', (req, res) => playlistController.getById(req, res))
router.post('/', authMiddleware, coverUpload, (req, res) => playlistController.create(req, res))
router.patch('/:id', authMiddleware, coverUpload, (req, res) => playlistController.update(req, res))
router.delete('/:id', authMiddleware, (req, res) => playlistController.delete(req, res))

export default router
