import { Router } from 'express'
import { authMiddleware, adminOnly } from '../middleware/auth.js'
import { songUpload } from '../middleware/upload.js'
import { songController } from '../controllers/song.controller.js'

const router = Router()

router.get('/', (req, res) => songController.list(req, res))
router.get('/admin', authMiddleware, adminOnly, (req, res) => songController.listAdmin(req, res))
router.get('/pending', authMiddleware, adminOnly, (req, res) => songController.listPending(req, res))
router.get('/my-songs', authMiddleware, (req, res) => songController.listMySongs(req, res))
router.get('/stats', authMiddleware, adminOnly, (req, res) => songController.getStats(req, res))
router.get('/slug/:slug', (req, res) => songController.getBySlug(req, res))
router.get('/:id', (req, res) => songController.getById(req, res))
router.post('/', authMiddleware, songUpload, (req, res) => songController.create(req, res))
router.patch('/:id', authMiddleware, songUpload, (req, res) => songController.update(req, res))
router.patch('/:id/approve', authMiddleware, adminOnly, (req, res) => songController.approve(req, res))
router.patch('/:id/reject', authMiddleware, adminOnly, (req, res) => songController.reject(req, res))
router.patch('/:id/hide', authMiddleware, adminOnly, (req, res) => songController.hide(req, res))
router.patch('/:id/publish', authMiddleware, adminOnly, (req, res) => songController.publish(req, res))
router.patch('/:id/play', (req, res) => songController.play(req, res))
router.delete('/:id', authMiddleware, (req, res) => songController.delete(req, res))

export default router
