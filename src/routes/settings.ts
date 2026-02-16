import { Router } from 'express'
import { authMiddleware, adminOnly } from '../middleware/auth.js'
import { settingsController } from '../controllers/settings.controller.js'

const router = Router()

router.get('/', (req, res) => settingsController.getAll(req, res))
router.get('/:group', (req, res) => settingsController.getByGroup(req, res))
router.post('/', authMiddleware, adminOnly, (req, res) => settingsController.upsertMany(req, res))

export default router
