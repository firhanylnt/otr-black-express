import { Router } from 'express'
import { authMiddleware, adminOnly } from '../middleware/auth.js'
import { programImageUpload, episodeAudioUpload } from '../middleware/upload.js'
import { programController } from '../controllers/program.controller.js'

const router = Router()

router.get('/', (req, res) => programController.list(req, res))
router.get('/schedule', (req, res) => programController.getSchedule(req, res))
router.get('/slug/:slug', (req, res) => programController.getBySlug(req, res))
router.get('/episodes/:episodeId', (req, res) => programController.getEpisodeById(req, res))
router.get('/:id', (req, res) => programController.getById(req, res))
router.get('/:id/episodes', (req, res) => programController.getEpisodes(req, res))
router.post('/', authMiddleware, adminOnly, programImageUpload, (req, res) => programController.create(req, res))
router.patch('/:id', authMiddleware, adminOnly, programImageUpload, (req, res) => programController.update(req, res))
router.delete('/:id', authMiddleware, adminOnly, (req, res) => programController.delete(req, res))
router.post('/:id/episodes', authMiddleware, adminOnly, episodeAudioUpload, (req, res) => programController.createEpisode(req, res))
router.post('/:id/episodes/bulk', authMiddleware, adminOnly, (req, res) => programController.createEpisodesBulk(req, res))
router.patch('/episodes/:episodeId', authMiddleware, adminOnly, episodeAudioUpload, (req, res) => programController.updateEpisode(req, res))
router.delete('/episodes/:episodeId', authMiddleware, adminOnly, (req, res) => programController.deleteEpisode(req, res))

export default router
