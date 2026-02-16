import { Router } from 'express'
import { authMiddleware, adminOnly } from '../middleware/auth.js'
import { historyController } from '../controllers/history.controller.js'

const router = Router()

router.post('/log-play', authMiddleware, (req, res) => historyController.logPlay(req, res))
router.get('/me', authMiddleware, (req, res) => historyController.getMyHistory(req, res))
router.post('/update', authMiddleware, (req, res) => historyController.updateProgress(req, res))
router.post('/sync', authMiddleware, (req, res) => historyController.syncHistory(req, res))
router.get('/admin/analytics', authMiddleware, adminOnly, (req, res) => historyController.getAnalytics(req, res))
router.get('/admin/top-songs', authMiddleware, adminOnly, (req, res) => historyController.getTopSongs(req, res))
router.get('/admin/top-listeners', authMiddleware, adminOnly, (req, res) => historyController.getTopListeners(req, res))
router.get('/admin/daily', authMiddleware, adminOnly, (req, res) => historyController.getDailyPlays(req, res))

export default router
